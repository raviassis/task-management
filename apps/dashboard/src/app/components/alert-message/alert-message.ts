import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-alert',
  template: `
  @if(message) {
    <div
      class="bg-red-600 text-white px-4 py-3 rounded-md shadow-md mt-4"
      role="alert"
    >
      {{ message }}
    </div>
  }
  `,
})
export class AlertComponent implements OnChanges {
  @Input() message: string | null = null;
  private timeoutId?: number;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['message'] && this.message) {
      this.showAlertTemporarily();
    }
  }

  private showAlertTemporarily() {

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this.message = null;
    }, 5000);
  }
}
