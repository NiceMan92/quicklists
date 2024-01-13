import { Injectable, computed, signal } from "@angular/core";
import { AddChecklistItem, ChecklistItem, RemoveChecklistItem } from "../../shared/interfaces/checklist-item";
import { Subject, tap } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RemoveChecklist } from "../../shared/interfaces/checklist";

export interface ChecklistItemState {
  checklistItems: ChecklistItem[];
}

@Injectable({
  providedIn: 'root'
})
export class ChecklistItemService {

  // State
  #state = signal<ChecklistItemState>({
    checklistItems: []
  });

  // Selectors
  checklistItems = computed(() => this.#state().checklistItems);

  // source
  add$ = new Subject<AddChecklistItem>();

  toggle$ = new Subject<RemoveChecklistItem>();

  toggleAll$ = new Subject<RemoveChecklist[]>();

  // reducers
  constructor() {
    this.add$.pipe(takeUntilDestroyed())
    .subscribe((checklistItem) => {
      this.#state.update((state) => ({
        ...state,
        checklistItems: [...state.checklistItems, {
          ...checklistItem.item,
          checklistId: checklistItem.checklistId,
          checked: false,
          id: Date.now().toString()
        }],
      }))
    });

    this.toggle$.pipe(takeUntilDestroyed())
    .subscribe((itemId) => {
      this.#state.update((state) =>({
        ...state,
        checklistItems: state.checklistItems.map(item =>
          item.id === itemId ?
             {
              ...item,
              checked: !item.checked
            }
          : item
        )
      }));
    });

    this.toggleAll$.pipe(takeUntilDestroyed(), tap(console.log))
    .subscribe((checklistIds) => {
      this.#state.update((state) =>({
        ...state,
        checklistItems: state.checklistItems.map(item =>
          item.checklistId === checklistIds ?
             {
              ...item,
              checked: true
            }
          : item
        )
      }));
    });
  }

}

