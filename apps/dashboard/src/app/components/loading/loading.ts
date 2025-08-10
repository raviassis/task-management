import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading',
  template: `
  @if(loading) {
    <div
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <svg
        class="animate-spin h-16 w-16 text-green-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        ></path>
      </svg>
    </div>
  
  }
  `,
})
export class LoadingComponent {
  @Input() loading = false;
}
