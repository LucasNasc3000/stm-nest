import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeModule } from 'src/employee/employee.module';
import { SupplyModule } from 'src/supply/suppy.module';
import appConfig from './app.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ConfigModule.forFeature(appConfig),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(appConfig)],
      inject: [appConfig.KEY],
      useFactory: async (appConfigParam: ConfigType<typeof appConfig>) => {
        return {
          type: 'postgres',
          host: appConfigParam.host,
          port: appConfigParam.port,
          username: appConfigParam.username,
          database: appConfigParam.database,
          password: appConfigParam.password,
          autoLoadEntities: appConfigParam.autoLoadEntities,
          synchronize: appConfigParam.synchronize,
        };
      },
    }),
    EmployeeModule,
    SupplyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
