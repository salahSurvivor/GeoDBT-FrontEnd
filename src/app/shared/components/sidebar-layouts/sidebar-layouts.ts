import { Component, Output, EventEmitter  } from '@angular/core';
import { RouterLink } from "@angular/router";
//import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar-layouts',
  standalone: true,           // ← important pour standalone
  imports: [RouterLink],    // ← RouterModule contient router-outlet
  templateUrl: './sidebar-layouts.html',
  styleUrls: ['./sidebar-layouts.css'], // ← 'styleUrls', pas 'styleUrl'
})
export class SidebarLayouts {
  @Output() sidebarToggle = new EventEmitter<boolean>();
  isExpanded = false;   // 👈 COLLAPSÉ PAR DÉFAUT
  active = 'Dashboard';

  menu = [
    { label: 'Dashboard', icon: 'pi pi-home', router:"/dashboard"},
    { label: 'Flotte', icon: 'pi pi-car',  router:"/flotte-vehicule"},
    { label: 'Finances', icon: 'pi pi-wallet', router:"/"},
    { label: 'Messages', icon: 'pi pi-envelope', router:"/"},
    { label: 'Documents', icon: 'pi pi-file', router:"/"},
    { label: 'Settings', icon: 'pi pi-cog', router:"/"}
  ];

  toggleSidebar() {
    console.log('1-toggleSidebar')
    this.isExpanded = !this.isExpanded;
    this.sidebarToggle.emit(this.isExpanded);
  }

  selectItem(label: string) {
    console.log('label: ', label)
    this.active = label;
  }
}