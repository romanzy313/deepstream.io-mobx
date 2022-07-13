import { MobxReactionUpdate } from '@adobe/lit-mobx';
import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createRef, Ref, ref } from 'lit/directives/ref.js';

import { RemoteList } from '../src/RemoteList';
import { baseDocName, dsClient } from './dsStore';
import { personStore } from './personStore';

@customElement('colors-list')
export class ColorsList extends MobxReactionUpdate(LitElement) {
  private colors = new RemoteList(baseDocName + '_colors', {
    client: dsClient.client,
  });

  static styles = css`
    .root {
      background-color: lightgray;
    }
    .color {
      padding: 4px;
      height: 40px;
      width: 40px;
      outline: none;
      border-style: none;
    }
  `;

  inputRef: Ref<HTMLInputElement> = createRef();

  renderColor(name: string) {
    return html`
      <button
        class="color"
        style="background-color: ${name}"
        @click=${() => {
          this.colors.removeEntry(name);
        }}
      ></button>
    `;
  }

  private addColor() {
    const input = this.inputRef.value!;
    this.colors.addEntry(input.value);
    input.value = ''; //clear it
    input.focus();
  }

  render() {
    if (!this.colors.isReady) return html` <div class="root">Loading...</div> `;

    return html`
      <div class="root">
        <div><strong>Colors</strong></div>
        <div style="margin-block: 4px;">
          ${this.colors.entities.map(color => this.renderColor(color))}
        </div>
        <div><small>Click to delete a color</small></div>

        <div>
          Add Color
          <input
            ${ref(this.inputRef)}
            @keypress=${e => {
              if (e.key == 'Enter') {
                this.addColor();
              }
            }}
          />
          <button
            @click=${() => {
              this.addColor();
            }}
          >
            Add
          </button>
        </div>
        <button @click=${() => this.colors.delete()}>
          Delete list ${this.colors.path}
        </button>
      </div>
    `;
  }
}
