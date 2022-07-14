import { MobxReactionUpdate } from '@adobe/lit-mobx';
import { html, css, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { createRef, Ref, ref } from 'lit/directives/ref.js';

import { RemoteList } from '../src/RemoteList';
import { baseDocName, dsClient } from './dsStore';

@customElement('colors-list')
export class ColorsList extends MobxReactionUpdate(LitElement) {
  private colors = new RemoteList(baseDocName + '_colors', {
    client: dsClient.client,
  });

  // private list = dsClient.client.record.getList('test');

  static styles = css`
    .root {
      background-color: lightgray;
      padding: 10px;
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

  @state()
  listItems: string[] = [];

  connectedCallback() {
    super.connectedCallback();
    // this.list.subscribe(e => {
    //   this.listItems = e;
    //   this.requestUpdate('listItems');
    // });
  }

  renderColor(name: string) {
    return html`
      <button
        class="color"
        style="background-color: ${name}"
        @click=${() => {
          this.colors.removeEntry(name);
          // this.list.removeEntry(name);
        }}
      ></button>
    `;
  }

  private addColor() {
    const input = this.inputRef.value!;
    this.colors.addEntry(input.value);
    // this.list.addEntry(input.value);
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

/*
          <div>
          <div><strong>Manual Colors</strong></div>
          <div style="margin-block: 4px;">
            ${this.listItems.map(color => this.renderColor(color))}
          </div>
          <div><small>Click to delete a color</small></div>
        </div>
 */
