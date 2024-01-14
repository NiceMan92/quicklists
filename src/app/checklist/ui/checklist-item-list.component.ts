import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ChecklistItem, RemoveChecklistItem } from "../../shared/interfaces/checklist-item";

@Component({
  selector: 'app-checklist-item-list',
  standalone: true,
  template:`
  <section>
    <ul>
    @for (checklistItem of  checklistItems; track checklistItem.id) {
      <li>
        <div>
          @if (checklistItem.checked) {
            <span>✅</span>
          }
          <p>{{checklistItem.title}}</p>
          <button (click)="toggle.emit(checklistItem.id)">Toggle</button>
        </div>

      </li>
    } @empty {
      <li>
        <div>
        <h2> Add an item</h2>
        <p>Click the add button to add your first item to this quicklist</p>
        </div>
      </li>
    }
    </ul>
    </section>
  `
})
export class ChecklistItemListComponent {
  @Input({ required: true}) checklistItems!: ChecklistItem[];
  @Output() toggle = new EventEmitter<RemoveChecklistItem>;

}
