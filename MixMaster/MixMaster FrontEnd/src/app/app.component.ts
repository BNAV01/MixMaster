import { Component, OnInit, HostListener, NgModule, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HeaderComponent } from './components/header/header.component';
import { BodyComponent } from './components/body/body.component';
import { HeroComponent } from './components/hero/hero.component';
import { FooterComponent } from './components/footer/footer.component';
import { RouterOutlet } from '@angular/router';
import { UsuarioCrudComponent } from './components/usuario-crud/usuario-crud.component';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    NavbarComponent, 
    HeaderComponent, 
    BodyComponent, 
    HeroComponent, 
    FooterComponent,
    UsuarioCrudComponent,
    HttpClientModule  // Solo HttpClientModule, no HttpClient
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Mix-Master';
}
