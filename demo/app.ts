import { MobxReactionUpdate } from '@adobe/lit-mobx';
import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
// import { baseDocName, dsClient } from './dsStore';

import './person-record';
import './colors-list';

@customElement('demo-app')
export class DemoApp extends MobxReactionUpdate(LitElement) {
  static styles = css`
    :host {
      display: block;
      border: solid 2px gray;
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
      <person-record></person-record>
      <colors-list></colors-list>
    `;
  }
}

// declare global {
//   interface HTMLElementTagNameMap {
//     "my-element": MyElement;
//   }
// }
