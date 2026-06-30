import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  
  // El decorador @EventPattern le dice a Nest que escuche este tópico de Kafka
  @EventPattern('enrollment.created')
  handleEnrollmentCreated(@Payload() data: any) {
    console.log('=========================================');
    console.log('🎉 ¡Enrollment Created! 🎉');
    console.log('=========================================');
    console.log('Student data:', data);
    
    // Aquí es donde, en el siguiente paso, pondremos la lógica de Mailtrap
    // para enviar el correo real al estudiante.
  }
}