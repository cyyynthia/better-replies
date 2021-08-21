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

const { React } = require('powercord/webpack');
const { FormTitle } = require('powercord/components');
const { RadioGroup, SwitchItem } = require('powercord/components/settings');

const ErrorBoundary = require('./ErrorBoundary.jsx')
const Preview = require('./Preview.jsx')

function Settings ({ getSetting, updateSetting, toggleSetting }) {
  return (
    <>
      <ErrorBoundary>
        <Preview appearance={getSetting('appearance', 'default')}/>
      </ErrorBoundary>

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
            desc: 'This will completely disable inline replies from showing up.',
            value: 'hidden'
          }
        ]}
      >
        Appearance
      </RadioGroup>
      <RadioGroup
        note='Affects the behavior of the mention toggle when writing a reply.'
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
        Outgoing replies settings
      </RadioGroup>
      <RadioGroup
        note='Affects how received replies behave regarding wether it will ping you or not.'
        onChange={(e) => updateSetting('ping', e.value)}
        value={getSetting('ping', 'default')}
        options={[
          {
            name: 'Default',
            desc: 'Honors the set behavior by the sender.',
            value: 'default'
          },
          {
            name: 'Never ping',
            desc: 'Suppress ping from replies sent with ping enabled. Note: this has no effect on mobile notifications.',
            value: 'never'
          },
          {
            name: 'Always ping',
            desc: 'Ping even if the sender disabled the ping. Note: this has no effect on mobile notifications.',
            value: 'always'
          }
        ]}
      >
        Incoming replies settings
      </RadioGroup>
      <SwitchItem
        disabled
        value={getSetting('quick-toggle', false)}
        onChange={() => toggleSetting('quick-toggle')}
        note2={'Whether the mention should be toggled when pressing backspace while you\'re at the beginning of the message. Currently a bit buggy :('}
        note={'This setting has been disabled due to a bug. Will be hopefully back before 2030.'}
      >
        Quick toggle
      </SwitchItem>
    </>
  );
}

module.exports = React.memo(Settings);
