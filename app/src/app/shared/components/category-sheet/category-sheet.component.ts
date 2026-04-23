import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { animate, style, transition, trigger } from '@angular/animations';

import {
  CategoryDefinition,
  CategoryUsageType,
  SaveCategoryInput,
} from '../../models/category.model';

const SHEET_ANIMATION = trigger('sheet', [
  transition(':enter', [
    style({ transform: 'translateY(100%)' }),
    animate(
      '320ms cubic-bezier(0.32, 0.72, 0, 1)',
      style({ transform: 'translateY(0)' }),
    ),
  ]),
  transition(':leave', [
    animate(
      '260ms cubic-bezier(0.32, 0.72, 0, 1)',
      style({ transform: 'translateY(100%)' }),
    ),
  ]),
]);

const OVERLAY_ANIMATION = trigger('overlay', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('220ms ease', style({ opacity: 1 })),
  ]),
  transition(':leave', [animate('220ms ease', style({ opacity: 0 }))]),
]);

interface ColorOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-category-sheet',
  templateUrl: './category-sheet.component.html',
  styleUrls: ['./category-sheet.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  animations: [SHEET_ANIMATION, OVERLAY_ANIMATION],
})
export class CategorySheetComponent implements OnInit, OnChanges {
  @Input() initialCategory: CategoryDefinition | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<SaveCategoryInput>();

  visible = true;
  label = '';
  icon = '';
  color = '#4F46E5';
  type: CategoryUsageType = 'expense';

  readonly colorOptions: ColorOption[] = [
    { value: '#4F46E5', label: 'Indigo' },
    { value: '#16A34A', label: 'Green' },
    { value: '#D97706', label: 'Amber' },
    { value: '#E11D48', label: 'Rose' },
    { value: '#2563EB', label: 'Blue' },
    { value: '#EA580C', label: 'Orange' },
    { value: '#6B7280', label: 'Slate' },
  ];

  get isEditing(): boolean {
    return !!this.initialCategory;
  }

  get isValid(): boolean {
    return this.label.trim().length > 1 && this.icon.trim().length > 0;
  }

  ngOnInit(): void {
    this.applyInitialCategory();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialCategory']) {
      this.applyInitialCategory();
    }
  }

  close(): void {
    this.visible = false;
    setTimeout(() => this.closed.emit(), 280);
  }

  selectType(type: CategoryUsageType): void {
    this.type = type;
  }

  selectColor(color: string): void {
    this.color = color;
  }

  submit(): void {
    if (!this.isValid) {
      return;
    }

    this.saved.emit({
      id: this.initialCategory?.id,
      label: this.label.trim(),
      icon: this.icon.trim(),
      color: this.color,
      type: this.type,
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.visible) {
      this.close();
    }
  }

  private applyInitialCategory(): void {
    this.label = this.initialCategory?.label ?? '';
    this.icon = this.initialCategory?.icon ?? '';
    this.color = this.initialCategory?.color ?? '#4F46E5';
    this.type = this.initialCategory?.type ?? 'expense';
  }
}
