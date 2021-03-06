import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ConversationDTO } from '../_models/ConversationDTO';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConversationService {

  baseUrl = environment.apiUrl + 'logged';

  constructor(private http: HttpClient) { }

  getUserConversations(): Observable<ConversationDTO[]> {
    return this.http.get<ConversationDTO[]>(this.baseUrl + '/conversation/');
  }

  createConversation(model: any) {
    return this.http.post(this.baseUrl + '/conversation', model);
  }

  deleteConversation(conversationId: number) {
    return this.http.delete(this.baseUrl + '/conversation/' + conversationId);
  }
}
