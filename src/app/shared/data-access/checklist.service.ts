import { Injectable, computed, signal } from "@angular/core";
import { takeUntilDestroyed} from "@angular/core/rxjs-interop"
import { Subject} from "rxjs";
import { AddChecklist, Checklist } from "../interfaces/checklist";

export interface ChecklistsState {
  checklists: Checklist[];
}

@Injectable({
  providedIn: 'root'
})
export class ChecklistService {
  // state
  private state = signal<ChecklistsState>({
    checklists: []
  });

  // selectors
  checklists = computed(() => this.state().checklists);

  // sources
  add$ = new Subject<AddChecklist>();

  constructor() {
    // reducers
    this.add$.pipe(takeUntilDestroyed()).subscribe((newChecklist) => {
      this.state.update(state => ({
        ...state,
        checklists: [...state.checklists, this.addToChecklist(newChecklist)]
      }));
    });

  }

  private addToChecklist(newChecklist: AddChecklist): Checklist {
    return {id: this.generateSlug(newChecklist.title), ...newChecklist};
  }

  private generateSlug(title : string): string {
    let slug = title.toLowerCase().replace(/\s+/g, '-');
    const exists = this.checklists().find((cl) => cl.title === slug);
    if ( exists ) {
      slug = slug + Date.now().toString();
    }
    return slug;
  }

}
