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

const { React, getModule } = require('powercord/webpack');
const { FormTitle } = require('powercord/components');
const { RadioGroup, SwitchItem } = require('powercord/components/settings');

const ChannelMessage = getModule([ 'MESSAGE_ID_PREFIX' ], false).default;
const Message = getModule(m => m.prototype && m.prototype.getReaction && m.prototype.isSystemDM, false);
const discordSettings = getModule([ 'messageDisplayCompact' ], false);

const CHANNEL = {
  isPrivate: () => false,
  isSystemDM: () => false,
  getGuildId: () => 'uwu'
};

const MESSAGE_REF = new Message({
  id: 'owo',
  author: {
    id: 'a',
    username: 'Ben',
    toString: () => 'Ben',
    isSystemUser: () => false,
    isVerifiedBot: () => false,
    getAvatarURL: () => 'https://powercord.dev/api/v2/avatar/465668689920917534.png'
  },
  content: 'Bowser be droppin another hot plugin soon™️'
});

const MESSAGE = new Message({
  id: 'uwu',
  type: 19,
  author: {
    id: 'b',
    username: 'Bowser65',
    toString: () => 'Bowser65',
    isSystemUser: () => false,
    isVerifiedBot: () => false,
    getAvatarURL: () => 'https://powercord.dev/api/v2/avatar/94762492923748352.png'
  },
  content: 'Heck yeah 😎', // I could have put a lot of salt but the babies would have cried again 🙄
  messageReference: {
    __betterRepliesFakeMessage: MESSAGE_REF
  }
});

function Settings ({ getSetting, updateSetting, toggleSetting }) {
  return (
    <>
      <div
        style={{
          marginBottom: 20,
          pointerEvents: 'none'
        }}
      >
        <ChannelMessage
          compact={discordSettings.messageDisplayCompact}
          channel={CHANNEL}
          message={MESSAGE}
          id='uwu'
          groupId='uwu'
        />
      </div>
      <FormTitle tag='h4'>Settings</FormTitle>
      <div style={{ marginBottom: 20 }}/>
      <RadioGroup
        onChange={(e) => updateSetting('appearance', e.value)}
        value={getSetting('appearance', 'default')}
        options={[
          {
            name: 'Default',
            desc: 'Shows above the entire message.',
            value: 'default'
          },
          {
            name: 'Quote',
            desc: 'Will show as a quote, just above the message contents.',
            value: 'quote'
          },
          {
            name: 'Hidden',
            desc: 'Don\'t show the quoted message. You\'ll still see the "Replied to" note on the message.',
            value: 'hidden'
          }
        ]}
      >
        Appearance
      </RadioGroup>
      <RadioGroup
        onChange={(e) => updateSetting('mention', e.value)}
        value={getSetting('mention', 'always')}
        options={[
          {
            name: 'Always mention',
            desc: 'Default behavior. When replying, the mention will always be enabled.',
            value: 'always'
          },
          {
            name: 'Remember',
            desc: 'Will remember your last setting and re-apply it. If you disabled it it\'ll remain disabled and vice-versa.',
            value: 'remember'
          },
          {
            name: 'Never mention',
            desc: 'When replying, the mention will never be enabled.',
            value: 'never'
          }
        ]}
      >
        Mention settings
      </RadioGroup>
      <SwitchItem
        value={getSetting('quick-toggle', false)}
        onChange={() => toggleSetting('quick-toggle')}
        note={'Whether the mention should be toggled when pressing backspace while you\'re at the beginning of the message.'}
      >
        Quick toggle
      </SwitchItem>
      <SwitchItem
        value={getSetting('quick-reply', false)}
        onChange={() => toggleSetting('quick-reply')}
        note={<>Whether <code>Shift+Left Click</code> on a message should initiate a reply or not.<br/><br/>Configurable keybinds will eventually come before 2069.</>}
      >
        Quick reply
      </SwitchItem>
    </>
  );
}

module.exports = React.memo(Settings);
