import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { SidebarLayouts } from './shared/components/sidebar-layouts/sidebar-layouts';
import { AvatarModule } from 'primeng/avatar';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarLayouts, AvatarModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('front-end');
  /*
  active
  green-active
  */
  showHeader: boolean = true;
  sidebarExpanded = false;

  onSidebarToggle(state: boolean) {
    console.log('2-onSidebarToggle: ', state);
    this.sidebarExpanded = state;
  }

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      const currentRoute = this.router.url;
      this.showHeader = !(currentRoute === '/login' || currentRoute === '/register');
    });
  }

}
