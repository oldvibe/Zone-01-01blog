import { Routes } from '@angular/router';
import { Register } from './auth/register/register';
import { LoginComponent } from './auth/login/login.component';
import { PostsComponent } from './posts/posts.component';
import { ProfileComponent } from './profile/profile.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { PostDetailComponent } from './posts/post-detail.component';
import { ExploreComponent } from './explore/explore.component';
import { AdminComponent } from './admin/admin.component';
import { AdminDashboardComponent } from './admin/dashboard.component';
import { SettingsComponent } from './settings/settings.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: Register },
    { path: 'posts', component: PostsComponent },
    { path: 'posts/:id', component: PostDetailComponent },
    { path: 'explore', component: ExploreComponent },
    { path: 'profile', component: ProfileComponent },
    { path: 'profile/:username', component: ProfileComponent },
    { path: 'notifications', component: NotificationsComponent },
    {
        path: 'admin',
        component: AdminComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: AdminDashboardComponent }
        ]
    },
    { path: 'settings', component: SettingsComponent }
];
