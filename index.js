/*
 * Copyright (c) 2020-2021 Cynthia K. Rey, All rights reserved.
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

const { React, getModule } = require('powercord/webpack');
const { Tooltip } = require('powercord/components');
const { findInReactTree } = require('powercord/util');
const { inject, uninject } = require('powercord/injector');
const { Plugin } = require('powercord/entities');

const Settings = require('./Settings');

module.exports = class BetterReplies extends Plugin {
  async startPlugin () {
    this.loadStylesheet('style.css');
    powercord.api.settings.registerSettings(this.entityID, {
      category: this.entityID,
      label: 'Better Replies',
      render: Settings
    });

    this.injectOutgoingReplies()
    this.injectIncomingReplies()
    this.injectFakeReference()
  }

  async injectOutgoingReplies () {
    const userStore = await getModule([ 'getCurrentUser', 'getUser' ]);
    const replierMdl = await getModule([ 'createPendingReply' ]);
    const Message = await getModule(m => (m.__powercordOriginal_default || m.default)?.toString().includes('childrenRepliedMessage'));
    const ChannelReply = await getModule(m => m.default?.displayName === 'ChannelReply');
    const ChannelTextAreaContainer = await getModule((m) => m.type?.render?.displayName === 'ChannelTextAreaContainer');

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
        res.props.children.props.children[2].props.children.splice(2, 0, res.props.children.props.children[0]);
      }
      if (appearance !== 'default') {
        res.props.children.props.children[0] = null;
      }

      return res;
    });

    /*
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

          // todo: fix this shit
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
    */

    ChannelReply.default.displayName = 'ChannelReply';
    ChannelTextAreaContainer.type.render.displayName = 'ChannelTextAreaContainer';
  }

  async injectIncomingReplies () {
    const userStore = await getModule([ 'getCurrentUser', 'getUser' ]);
    const messageHandler = await getModule([ 'createMessageRecord' ])
    const RepliedMessage = await getModule((m) => m.default?.displayName === 'RepliedMessage')

    inject('brep-notif-receive', messageHandler, 'createMessageRecord', (args) => {
      const msg = args[0]
      const user = userStore.getCurrentUser()
      const mode = this.settings.get('ping', 'default')

      if (mode === 'default' || msg.state === 'SENDING' || !msg.referenced_message) {
        return args
      }

      const isMentioned = Boolean(msg.mentions.find((u) => u.id === user.id))
      if (mode === 'never' && !msg.mention_everyone && isMentioned && !msg.content.includes(user.id)) {
        msg.message_reference.__brepSuppressed = true
        msg.mentions = msg.mentions.filter((u) => u.id !== user.id)
      }

      if (mode === 'always' && !isMentioned && msg.referenced_message.author.id === user.id && msg.author.id !== user.id) {
        msg.message_reference.__brepEnforced = true
        msg.mentions.push(user)
      }

      return args
    }, true)

    inject('brep-notif-visual', RepliedMessage, 'default', ([ { baseMessage: { messageReference } } ], res) => {
      if (messageReference.__brepEnforced || messageReference.__brepSuppressed) {
        const idx = res.props.children.findIndex((n) =>'withMentionPrefix' in n.props)
        const username = res.props.children[idx]
        username.props.withMentionPrefix = false

        if (messageReference.__brepSuppressed) {
          res.props.children[idx] = [
            React.createElement(Tooltip, { text: 'Ping suppressed' },
              React.createElement('span', { style: { color: 'var(--text-muted)' } }, '@')),
            username
          ]
        }
      }
      return res
    })

    RepliedMessage.default.displayName = 'RepliedMessage'
  }

  async injectFakeReference () {
    const referenceStore = await getModule([ 'getMessageByReference' ]);

    inject('brep-fake-ref', referenceStore, 'getMessageByReference', (args, res) => {
      if (args[0]?.__betterRepliesFakeMessage) {
        return {
          message: args[0].__betterRepliesFakeMessage,
          state: 0
        };
      }

      return res;
    });
  }

  pluginWillUnload () {
    powercord.api.settings.unregisterSettings(this.entityID);
    uninject('brep-reply-mention-setting');
    uninject('brep-reply-mention-toggle');
    uninject('brep-reply-appearance');
    uninject('brep-reply-quick-toggle');

    uninject('brep-notif-receive')
    uninject('brep-notif-visual')

    uninject('brep-fake-ref');
  }
};
