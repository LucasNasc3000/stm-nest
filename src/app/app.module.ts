import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { CsrfGuard } from 'src/auth/guards/csrf.guard';
import { ThrottlerBehindProxyGuard } from 'src/auth/guards/throttler-behind-proxy.guard';
import { EmployeeModule } from 'src/employee/employee.module';
import { JWTBlacklistModule } from 'src/jwt-blacklist/jwt-blacklist.module';
import { LogsModule } from 'src/logs-register/log.module';
import { OutflowModule } from 'src/outflow/outflow.module';
import { ProductModule } from 'src/product/product.module';
import { RefreshTokensModule } from 'src/refresh-tokens/refresh-token.module';
import { SaleModule } from 'src/sale/sale.module';
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
    ThrottlerModule.forRoot([
      {
        name: 'auth',
        ttl: 60000,
        limit: 5,
      },
      {
        name: 'write',
        ttl: 10000,
        limit: 10,
      },
      {
        name: 'read',
        ttl: 10000,
        limit: 50,
      },
      {
        name: 'global',
        ttl: 60000,
        limit: 100,
      },
    ]),
    EmployeeModule,
    SupplyModule,
    OutflowModule,
    SaleModule,
    ProductModule,
    AuthModule,
    JWTBlacklistModule,
    LogsModule,
    RefreshTokensModule,
    CacheModule.register({
      isGlobal: true,
      ttl: 1000 * 60 * 60 * 24,
      max: 80,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthTokenGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
  ],
})
export class AppModule {}
