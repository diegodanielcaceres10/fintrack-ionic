import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';

import {
  CreateTransactionInput,
  TransactionCategory,
  TransactionType,
} from '../../shared/models/transaction.model';

interface CategoryOption {
  id: TransactionCategory;
  icon: string;
  label: string;
}

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

@Component({
  selector: 'app-add-transaction',
  templateUrl: 'add-transaction.component.html',
  styleUrls: ['add-transaction.component.scss'],
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  animations: [SHEET_ANIMATION, OVERLAY_ANIMATION],
})
export class AddTransactionComponent implements OnInit {
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<CreateTransactionInput>();

  @ViewChild('amountInput') amountInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('sheet') sheetRef!: ElementRef<HTMLElement>;

  visible = true;
  type: TransactionType = 'expense';
  amountRaw = '';
  selectedCategoryId: TransactionCategory = 'food';
  note = '';
  date = new Date().toISOString().split('T')[0];

  readonly expenseCategories: CategoryOption[] = [
    { id: 'food', icon: '🛒', label: 'Food' },
    { id: 'housing', icon: '🏠', label: 'Housing' },
    { id: 'transport', icon: '🚇', label: 'Transport' },
    { id: 'entertainment', icon: '🎬', label: 'Entertainment' },
    { id: 'health', icon: '💊', label: 'Health' },
    { id: 'shopping', icon: '🛍️', label: 'Shopping' },
    { id: 'utilities', icon: '⚡', label: 'Utilities' },
    { id: 'travel', icon: '✈️', label: 'Travel' },
    { id: 'other', icon: '📦', label: 'Other' },
  ];

  readonly incomeCategories: CategoryOption[] = [
    { id: 'salary', icon: '💰', label: 'Salary' },
    { id: 'freelance', icon: '💻', label: 'Freelance' },
    { id: 'gift', icon: '🎁', label: 'Gift' },
    { id: 'refund', icon: '↩️', label: 'Refund' },
    { id: 'other', icon: '📦', label: 'Other' },
  ];

  private dragStartY = 0;
  private dragCurrent = 0;
  private isDragging = false;

  get amountValue(): number {
    return parseFloat(this.amountRaw) || 0;
  }

  get categories(): CategoryOption[] {
    return this.type === 'expense'
      ? this.expenseCategories
      : this.incomeCategories;
  }

  get isValid(): boolean {
    return this.amountValue > 0 && !!this.selectedCategoryId;
  }

  open(): void {
    this.visible = true;
  }

  close(): void {
    this.visible = false;
    setTimeout(() => this.closed.emit(), 280);
  }

  setType(type: TransactionType): void {
    this.type = type;
    this.selectedCategoryId = this.categories[0].id;
  }

  selectCategory(id: TransactionCategory): void {
    this.selectedCategoryId = id;
  }

  onAmountInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const cleaned = raw
      .replace(/[^0-9.]/g, '')
      .replace(/^(\d*\.?\d{0,2}).*$/, '$1');
    this.amountRaw = cleaned;
    (event.target as HTMLInputElement).value = cleaned;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.visible) this.close();
  }

  onDragStart(event: TouchEvent | MouseEvent): void {
    this.isDragging = true;
    this.dragStartY = this.clientY(event);
    this.dragCurrent = 0;
  }

  onDragMove(event: TouchEvent | MouseEvent): void {
    if (!this.isDragging) return;
    const delta = this.clientY(event) - this.dragStartY;
    if (delta < 0) return;
    this.dragCurrent = delta;
    if (this.sheetRef) {
      this.sheetRef.nativeElement.style.transform = `translateY(${delta}px)`;
      this.sheetRef.nativeElement.style.transition = 'none';
    }
  }

  onDragEnd(): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    if (this.sheetRef) {
      this.sheetRef.nativeElement.style.transition = '';
      this.sheetRef.nativeElement.style.transform = '';
    }
    if (this.dragCurrent > 100) this.close();
  }

  submit(): void {
    if (!this.isValid) return;

    this.saved.emit({
      type: this.type,
      amount: this.amountValue,
      categoryId: this.selectedCategoryId,
      note: this.note.trim(),
      date: this.date,
    });
  }

  ngOnInit(): void {}

  private clientY(event: TouchEvent | MouseEvent): number {
    return event instanceof TouchEvent
      ? (event.touches[0]?.clientY ?? 0)
      : event.clientY;
  }
}
