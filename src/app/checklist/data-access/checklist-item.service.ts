import { Injectable, computed, effect, inject, signal } from "@angular/core";
import { AddChecklistItem, ChecklistItem, RemoveChecklistItem } from "../../shared/interfaces/checklist-item";
import { Subject, tap } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RemoveChecklist } from "../../shared/interfaces/checklist";
import { StorageService } from "../../shared/data-access/storage.service";

export interface ChecklistItemState {
  checklistItems: ChecklistItem[];
  loaded: boolean,
  error: string | null
}

@Injectable({
  providedIn: 'root'
})
export class ChecklistItemService {

  storageService = inject(StorageService);

  // State
  #state = signal<ChecklistItemState>({
    checklistItems: [],
    loaded: false,
    error: null
  });

  // Selectors
  checklistItems = computed(() => this.#state().checklistItems);
  loaded = computed(() => this.#state().loaded);

  // source
  add$ = new Subject<AddChecklistItem>();

  #checklistItemsLoaded$ = this.storageService.loadChecklistItems();

  toggle$ = new Subject<RemoveChecklistItem>();

  reset$ = new Subject<RemoveChecklist>();

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

    this.reset$.pipe(takeUntilDestroyed())
    .subscribe((checklistId) => {
      this.#state.update((state) =>({
        ...state,
        checklistItems: state.checklistItems.map(item =>
          item.checklistId === checklistId ?
             {
              ...item,
              checked: false
            }
          : item
        )
      }));
    });

    this.#checklistItemsLoaded$.pipe(takeUntilDestroyed())
    .subscribe({
      next: (checklistItems) => this.#state.update(state => ({...state, checklistItems, loaded: true})),
      error: (error) => this.#state.update((state) => ({...state, error}))
    });

    effect(() => {
      if (this.loaded()){ // to prevent us from overwriting our saved data with empty arrays
        this.storageService.saveCheckList(this.checklistItems());
      }
    });
  }

}

