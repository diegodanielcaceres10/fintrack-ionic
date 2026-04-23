import {
  Component,
  Input,
  OnInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  Output,
  EventEmitter,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import { Subscription } from 'rxjs';

import {
  CreateTransactionInput,
  Transaction,
  TransactionCategory,
  TransactionType,
} from '../../shared/models/transaction.model';
import { CategoryDefinition } from '../../shared/models/category.model';
import { CategoryStorageService } from '../../shared/services/category-storage.service';

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
export class AddTransactionComponent implements OnInit, OnChanges, OnDestroy {
  @Input() initialTransaction: Transaction | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<CreateTransactionInput>();

  @ViewChild('amountInput') amountInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('sheet') sheetRef!: ElementRef<HTMLElement>;

  visible = true;
  type: TransactionType = 'expense';
  amountRaw = '';
  selectedCategoryId: TransactionCategory = '';
  note = '';
  date = new Date().toISOString().split('T')[0];

  private categoriesSubscription?: Subscription;
  private categoryDefinitions: CategoryDefinition[] = [];
  private pendingInitialTransaction: Transaction | null = null;

  constructor(private readonly categoryStorage: CategoryStorageService) {}

  get amountValue(): number {
    return parseFloat(this.amountRaw) || 0;
  }

  get categories(): CategoryOption[] {
    return this.categoryDefinitions
      .filter(
        (category) =>
          category.type === this.type || category.type === 'both',
      )
      .map((category) => ({
        id: category.id,
        icon: category.icon,
        label: category.label,
      }));
  }

  get isValid(): boolean {
    return this.amountValue > 0 && !!this.selectedCategoryId;
  }

  get isEditing(): boolean {
    return !!this.initialTransaction;
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
    this.ensureSelectedCategory();
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

  ngOnInit(): void {
    this.categoriesSubscription = this.categoryStorage.categories$.subscribe(
      (categories) => {
        this.categoryDefinitions = categories;
        this.applyPendingState();
      },
    );
    this.pendingInitialTransaction = this.initialTransaction;
    this.applyPendingState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialTransaction']) {
      this.pendingInitialTransaction = this.initialTransaction;
      this.applyPendingState();
    }
  }

  ngOnDestroy(): void {
    this.categoriesSubscription?.unsubscribe();
  }

  private dragStartY = 0;
  private dragCurrent = 0;
  private isDragging = false;

  private clientY(event: TouchEvent | MouseEvent): number {
    return event instanceof TouchEvent
      ? (event.touches[0]?.clientY ?? 0)
      : event.clientY;
  }

  private applyPendingState(): void {
    if (this.categoryDefinitions.length === 0) {
      return;
    }

    if (this.pendingInitialTransaction) {
      this.type = this.pendingInitialTransaction.type;
      this.amountRaw = Math.abs(this.pendingInitialTransaction.amount).toString();
      this.selectedCategoryId = this.pendingInitialTransaction.category;
      this.note = this.pendingInitialTransaction.name;
      this.date = this.pendingInitialTransaction.date;
      this.ensureSelectedCategory();
      this.pendingInitialTransaction = null;
      return;
    }

    if (!this.initialTransaction) {
      this.resetForm();
    }
  }

  private resetForm(): void {
    this.type = 'expense';
    this.amountRaw = '';
    this.selectedCategoryId = '';
    this.note = '';
    this.date = new Date().toISOString().split('T')[0];
    this.ensureSelectedCategory();
  }

  private ensureSelectedCategory(): void {
    if (this.categories.length === 0) {
      this.selectedCategoryId = '';
      return;
    }

    const exists = this.categories.some(
      (category) => category.id === this.selectedCategoryId,
    );

    if (!exists) {
      this.selectedCategoryId = this.categories[0].id;
    }
  }
}
