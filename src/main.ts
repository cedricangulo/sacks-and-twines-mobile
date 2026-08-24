import { provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  basket,
  fileTrayOutline,
  receipt,
  receiptOutline,
  searchOutline,
  swapHorizontal,
  trash,
} from 'ionicons/icons';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

addIcons({
  basket,
  fileTrayOutline,
  receipt,
  receiptOutline,
  searchOutline,
  swapHorizontal,
  trash,
});

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
  ],
});
