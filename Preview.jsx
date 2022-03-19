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

const ChannelMessage = getModule([ 'getElementFromMessageId' ], false).default;
const Message = getModule(m => m.prototype && m.prototype.getReaction && m.prototype.isSystemDM, false);
const DiscordSettings = getModule([ 'MessageDisplayCompact' ], false);

const CHANNEL = {
  isPrivate: () => false,
  isSystemDM: () => false,
  getGuildId: () => 'uwu',
  isArchivedThread: () => false,
  isThread: () => false,
  isForumPost: () => false,
};

const MESSAGE_REF = new Message({
  id: 'owo',
  author: {
    id: 'a',
    username: 'Ben',
    toString: () => 'Ben',
    isSystemUser: () => false,
    isVerifiedBot: () => false,
    isNonUserBot: () => false,
    getAvatarURL: () => 'https://powercord.dev/api/v2/avatar/465668689920917534.png'
  },
  content: 'Cynthia be droppin another hot plugin soon™️',
});

const MESSAGE = new Message({
  id: 'uwu',
  type: 19,
  author: {
    id: 'b',
    username: 'Cynthia 🌹',
    toString: () => 'Cynthia 🌹',
    isSystemUser: () => false,
    isVerifiedBot: () => false,
    isNonUserBot: () => false,
    getAvatarURL: () => 'https://powercord.dev/api/v2/avatar/94762492923748352.png'
  },
  content: 'Heck yeah 😎',
  messageReference: { __betterRepliesFakeMessage: MESSAGE_REF },
});

function Settings ({ appearance }) {
  const compact = DiscordSettings.MessageDisplayCompact.useSetting()

  return (
    <ol className='better-replies-preview-container'>
      <ChannelMessage
        compact={compact}
        channel={CHANNEL}
        message={MESSAGE}
        id={`uwu-${appearance}`}
        groupId='uwu'
      />
    </ol>
  );
}

module.exports = React.memo(Settings);
