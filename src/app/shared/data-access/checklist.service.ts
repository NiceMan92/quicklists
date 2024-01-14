import { Injectable, computed, effect, inject, signal } from "@angular/core";
import { takeUntilDestroyed} from "@angular/core/rxjs-interop"
import { Subject, catchError, of} from "rxjs";
import { AddChecklist, Checklist } from "../interfaces/checklist";
import { StorageService } from "./storage.service";

export interface ChecklistsState {
  checklists: Checklist[];
  error: string | null;
  loaded: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChecklistService {

  storageService = inject(StorageService);

  // state
  private state = signal<ChecklistsState>({
    checklists: [],
    loaded: false,
    error: null
  });

  // selectors
  checklists = computed(() => this.state().checklists);
  loaded = computed(() => this.state().loaded);


  // sources
  add$ = new Subject<AddChecklist>();

  #checklistsLoaded$ = this.storageService.loadChecklists();

  constructor() {
    // reducers
    this.add$.pipe(takeUntilDestroyed()).subscribe((newChecklist) => {
      this.state.update(state => ({
        ...state,
        checklists: [...state.checklists, this.addToChecklist(newChecklist)]
      }));
    });

    this.#checklistsLoaded$.pipe(takeUntilDestroyed()).subscribe({
      next: (checklists) => {
        this.state.update((state => ({
          ...state,
          checklists,
          loaded: true
          }))
        );
      },
      error: (error) => this.state.update((state) => ({...state, error}))
    });

    effect(() => {
      if (this.loaded()){ // to prevent us from overwriting our saved data with empty arrays
        this.storageService.saveCheckList(this.checklists());
      }
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
