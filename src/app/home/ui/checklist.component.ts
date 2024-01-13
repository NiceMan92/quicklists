import { Component, Input } from "@angular/core";
import { Checklist } from "../../shared/interfaces/checklist";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-checklist-list',
  standalone: true,
  template: `
    <ul>
      @for (checklist of checklists; track checklist.id) {
        <li>
          <a [routerLink]="['/checklist',checklist.id]">{{checklist.title}}</a>
        </li>
      } @empty {
        <li>nothing to do</li>
      }
    </ul>
  `,
  styles: [],
  imports:[RouterLink]
})
export class ChecklistListComponent {

  @Input({required: true}) checklists!: Checklist[];
}
