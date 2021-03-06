import { UserDTO } from './UserDTO';
import { MessageDTO } from './MessageDTO';
import { TaskSomeoneDetailsDTO } from './TaskSomeoneDetailsDTO';

export interface TaskApplicationDetailsDTO {
  id: number;
  user: UserDTO;
  taskSomeone: TaskSomeoneDetailsDTO;
  createdOn: Date;
  status: string;
  applyingMessage: MessageDTO;
}
