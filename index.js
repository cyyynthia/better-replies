/*
 * Copyright (c) 2020 Cynthia K. Rey, All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

const { getModule } = require('powercord/webpack');
const { findInReactTree, getReactInstance } = require('powercord/util');
const { inject, uninject } = require('powercord/injector');
const { Plugin } = require('powercord/entities');

const Settings = require('./Settings');

let prevFn = null;
let injectedFn = null;
module.exports = class BetterReplies extends Plugin {
  async startPlugin () {
    this.loadStylesheet('style.css');
    powercord.api.settings.registerSettings(this.entityID, {
      category: this.entityID,
      label: 'Better Replies',
      render: Settings
    });

    const userStore = await getModule([ 'getCurrentUser' ]);
    const referenceStore = await getModule([ 'getMessageByReference' ]);
    const replierMdl = await getModule([ 'createPendingReply' ]);
    const Message = await getModule(m => m.default?.displayName === 'Message');
    const ChannelReply = await getModule(m => m.default?.displayName === 'ChannelReply');
    const ChannelTextAreaContainer = await getModule((m) => m.type?.render?.displayName === 'ChannelTextAreaContainer');
    const MessageHeader = await getModule([ 'MessageTimestamp' ]);

    inject('brep-fake-ref', referenceStore, 'getMessageByReference', (args, res) => {
      if (args[0]?.__betterRepliesFakeMessage) {
        return {
          message: args[0].__betterRepliesFakeMessage,
          state: 0
        };
      }

      return res;
    });

    inject('brep-reply-mention-setting', replierMdl, 'createPendingReply', (args) => {
      const mode = this.settings.get('mention', 'always');
      if (mode === 'never') {
        args[0].shouldMention = false;
      }
      if (mode === 'remember') {
        const u = userStore.getCurrentUser();
        args[0].shouldMention = args[0].message.author.id !== u.id && this.settings.get('--mention-cache', true);
      }

      return args;
    }, true);

    inject('brep-reply-mention-toggle', ChannelReply, 'default', (_, res) => {
      const tooltip = findInReactTree(res, n => n.disableTooltipPointerEvents);
      const renderer = tooltip.children;
      tooltip.children = (e) => {
        const res = renderer(e);
        const checked = res.props['aria-checked'];
        const handler = res.props.onClick;
        res.props.onClick = (e) => {
          this.settings.set('--mention-cache', !checked);
          handler(e);
        };
        return res;
      };
      return res;
    });

    inject('brep-reply-appearance', Message, 'default', (_, res) => {
      const appearance = this.settings.get('appearance', 'default');
      if (appearance === 'quote') {
        res.props.children.props.children[1].props.children.splice(2, 0, res.props.children.props.children[0]);
      }
      if (appearance !== 'default') {
        res.props.children.props.children[0] = null;
      }

      const handler = res.props.children.props.onClick;
      res.props.children.props.onClick = (e, t) => {
        const quickReply = this.settings.get('quick-reply', false);
        if (quickReply && e.shiftKey) {
          e.preventDefault();
          e.stopPropagation();

          const u = userStore.getCurrentUser();
          const shouldMention = res.props.children.props.children[2].props.message.author.id !== u.id;
          replierMdl.createPendingReply({
            message: res.props.children.props.children[2].props.message,
            channel: res.props.children.props.children[2].props.channel,
            shouldMention
          });
          return;
        }
        handler(e, t);
      };

      return res;
    });

    inject('brep-reply-appearance-header', MessageHeader, 'default', (args, res) => {
      const noRepliedTo = this.settings.get('no-replied-to', false);
      if (noRepliedTo) {
        const replied = findInReactTree(res, n => n.className?.startsWith('replyLink'));
        if (replied) {
          replied.className += ' better-replies-hidden';
        }
      }
      return res;
    });

    inject('brep-reply-quick-toggle', ChannelTextAreaContainer.type, 'render', (args, res) => {
      const ta = findInReactTree(res, n => n.richValue && n.onKeyDown);
      if (ta.onKeyDown !== prevFn) {
        prevFn = ta.onKeyDown;
        injectedFn = ((prev, e) => {
          // I cba to do something decent, DOM access is enough
          const quickToggle = this.settings.get('quick-toggle', false);
          const toggler = document.querySelector('.channelTextArea-rNsIhG .mentionButton-3710-W');
          const reactInstance = getReactInstance(document.querySelector('.channelTextArea-rNsIhG'));
          const textarea = findInReactTree(reactInstance.memoizedProps, n => n.richValue && n.onKeyDown);
          const { selection } = textarea.richValue;

          if (quickToggle && toggler && e.key === 'Backspace' && selection.start.offset === 0 && selection.end.offset === 0) {
            toggler.click();
            return;
          }
          prev(e);
        }).bind(null, prevFn);
      }

      ta.onKeyDown = injectedFn;
      return res;
    });


    Message.default.displayName = 'Message';
    ChannelReply.default.displayName = 'ChannelReply';
    ChannelTextAreaContainer.type.render.displayName = 'ChannelTextAreaContainer';
  }

  pluginWillUnload () {
    prevFn = null;
    injectedFn = null;
    powercord.api.settings.unregisterSettings(this.entityID);
    uninject('brep-fake-ref');
    uninject('brep-reply-mention-setting');
    uninject('brep-reply-mention-toggle');
    uninject('brep-reply-appearance');
    uninject('brep-reply-appearance-header');
    uninject('brep-reply-quick-toggle');
  }
};
