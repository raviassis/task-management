import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { data } from '@task-management/data';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomePage {
  dataResp = data()
}
