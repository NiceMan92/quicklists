import { RouterLink } from '@angular/router';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Checklist } from '../../shared/interfaces/checklist';

@Component({
  standalone: true,
  selector: 'app-checklist-header',
  template: `
    <header>
      <a routerLink="/home">Back</a>
      <h1>
        {{ checklist.title }}
      </h1>
      <div>
        <button (click)="addItem.emit();">Add Item</button>
      </div>
    </header>
  `,
  imports: [RouterLink],
})
export class ChecklistHeaderComponent {
  @Input({ required: true }) checklist!: Checklist;
  @Output() addItem = new EventEmitter<void>();

}
