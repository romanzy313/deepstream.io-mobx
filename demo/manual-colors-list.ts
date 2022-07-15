import { MobxReactionUpdate } from '@adobe/lit-mobx';
import { html, css, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { createRef, Ref, ref } from 'lit/directives/ref.js';

import { RemoteList } from '../src/RemoteList';
import { baseDocName, dsClient } from './dsStore';

@customElement('manual-colors-list')
export class ManualColorsList extends LitElement {
  private list = dsClient.client.record.getList('manual-test');

  static styles = css`
    .root {
      background-color: grey;
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
  entries: string[] = [];

  connectedCallback() {
    super.connectedCallback();
    this.list.whenReady(list => {
      this.entries = list.getEntries();
      this.requestUpdate('entries');
      console.log('subscribing');

      // list.subscribe(ent => {
      //   console.log('all items', ent);
      // });

      list.on('entry-added', (entry, index) => {
        this.entries.splice(index, 0, entry);
        this.requestUpdate('entries');
      });
      list.on('entry-removed', (entry, index) => {
        this.entries.splice(index, 1);
        this.requestUpdate('entries');
      });
    });
    // this.list.subscribe(e => {
    //   this.listItems = e;
    //   this.requestUpdate('listItems');
    // });
  }

  renderColor(entry: string) {
    return html`
      <button
        class="color"
        style="background-color: ${entry}"
        @click=${() => {
          this.list.removeEntry(entry);
          // this.list.removeEntry(name);
        }}
      ></button>
    `;
  }

  private addEntry() {
    const input = this.inputRef.value!;
    console.log('adding', input.value);

    this.list.addEntry(input.value);
    // this.list.addEntry(input.value);
    input.value = ''; //clear it
    input.focus();
  }

  render() {
    // if (!this.list.isReady) return html` <div class="root">Loading...</div> `;

    return html`
      <div class="root">
        <div><strong>Colors</strong></div>
        <div style="margin-block: 4px;">
          ${this.entries.map(color => this.renderColor(color))}
        </div>
        <div><small>Click to delete a color</small></div>

        <div>
          Add Color
          <input
            ${ref(this.inputRef)}
            @keypress=${e => {
              if (e.key == 'Enter') {
                this.addEntry();
              }
            }}
          />
          <button
            @click=${() => {
              this.addEntry();
            }}
          >
            Add
          </button>
        </div>

        <button @click=${() => this.list.delete()}>
          Delete list ${this.list.name}
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
