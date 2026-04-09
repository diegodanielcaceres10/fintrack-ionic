import { Component } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonFab,
  IonFabButton,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonToolbar,
  IonTitle,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonContent,
    IonHeader,
    IonIcon,
    IonFab,
    IonFabButton,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonToolbar,
    IonTitle,
  ],
})
export class HomePage {
  syncNow() {
    console.log('Syncing now...');
    // Implement your sync logic here
  }
}
