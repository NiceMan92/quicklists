import { Component, computed, effect, inject, signal } from "@angular/core";
import { ChecklistService } from "../shared/data-access/checklist.service";
import { ActivatedRoute } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { ChecklistHeaderComponent } from "./ui/checklist-header.component";
import { FormBuilder } from "@angular/forms";
import { ChecklistItemService } from "./data-access/checklist-item.service";
import { ChecklistItem } from "../shared/interfaces/checklist-item";
import { ModalComponent } from "../shared/ui/modal.component";
import { FormModalComponent } from "../shared/ui/form-modal.component";
import { ChecklistItemListComponent } from "./ui/checklist-item-list.component";

@Component({
    standalone: true,
    selector: 'app-checklist',
    template: `
    @if (checklist(); as checklist ) {
      <app-checklist-header [checklist]="checklist" (addItem)="checklistItemBeingEdited.set({})" (reset)="checklistItemService.reset$.next($event)"/>
      <app-checklist-item-list [checklistItems]="items()" (toggle)="checklistItemService.toggle$.next($event)"/>
      <app-modal [isOpen]="!!checklistItemBeingEdited()">
      <ng-template>
      <app-form-modal [formGroup]="formGroup"
      title="Create item"
      (save)="checklistItemService.add$.next({item: formGroup.getRawValue(), checklistId: checklist.id })"
      (close)="checklistItemBeingEdited.set(null)"/>
      </ng-template>
      </app-modal>
    }
  `,
    imports: [ChecklistHeaderComponent, ModalComponent, FormModalComponent, ChecklistItemListComponent]
})
export default class ChecklistComponent {
  checklistService = inject(ChecklistService);
  checklistItemService = inject(ChecklistItemService);
  route = inject(ActivatedRoute);
  formBuilder = inject(FormBuilder);

  checklistItemBeingEdited = signal<Partial<ChecklistItem> | null>(null);

  params = toSignal(this.route.paramMap);

  formGroup = this.formBuilder.nonNullable.group({
    title: ''
  });

  checklist = computed(() =>
    this.checklistService
    .checklists()
    .find((checklist) => checklist.id === this.params()?.get('id'))
  );

  items = computed(() =>
    this.checklistItemService
      .checklistItems()
      .filter((item) => item.checklistId === this.params()?.get('id'))
  );

  constructor(){
    effect(() => {
      const checklistItem = this.checklistItemBeingEdited();
      if(!checklistItem){
        this.formGroup.reset();
      }
    });
  }

}
