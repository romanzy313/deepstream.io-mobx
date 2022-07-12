import { MobxReactionUpdate } from '@adobe/lit-mobx';
import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
// import { baseDocName, dsClient } from './dsStore';

import './person-record';

@customElement('demo-app')
export class DemoApp extends MobxReactionUpdate(LitElement) {
  static styles = css`
    :host {
      display: block;
      border: solid 8px gray;
      padding: 16px;
      max-width: 400px;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
  }

  /**
   * The number of times the button has been clicked.
   */
  @property({ type: Number })
  count = 0;

  render() {
    // if (!dsClient.isConnected || !dsClient.isLoggedIn) return html`Connecting...`;

    return html`
      <button @click=${this._onClick} part="button">
        Click Count: ${this.count}
      </button>
      <person-record></person-record>
    `;
  }

  private _onClick() {
    this.count++;
  }
}

// declare global {
//   interface HTMLElementTagNameMap {
//     "my-element": MyElement;
//   }
// }
