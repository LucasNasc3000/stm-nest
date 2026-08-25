export enum SupplyReason {
  ENTRY = 'entrada',
  RESTOCK = 'reposicao', // Reposição de estoque baixo
  INVENTORY_ADJUST = 'ajuste', // Ajuste após contagem incorreta de inventário (não entrada)
  DONATION = 'doacao', // Recebimento por doação
  TRANSFER = 'transferencia', // Transferência entre unidades
  LOSS_CORRECTION = 'correcao de perda', // Correção de perda registrada indevidamente
  OTHER = 'outro',
  WEIGHT_PER_UNIT_EDIT = 'edicao de peso unitario',
  EXPIRATION_DATE_EDIT = 'edicao de validade',
}
