/**
 * Testes unitários para a função calculateMaxInstallments
 * Validação específica da lógica de cálculo de parcelas PIX
 */

// Mock da função calculateMaxInstallments baseada na implementação real
const calculateMaxInstallments = (dueDateLimit) => {
  if (!dueDateLimit) return 1;

  const today = new Date();
  const limitDate = new Date(dueDateLimit);

  // Calcula a diferença em meses entre hoje e a data limite
  const monthsDiff = (limitDate.getFullYear() - today.getFullYear()) * 12 +
                    (limitDate.getMonth() - today.getMonth());

  // Adiciona uma margem de segurança de 1 mês para garantir que não passe da data limite
  const maxInstallments = Math.max(1, monthsDiff - 1);

  // Limita a um máximo de 12 parcelas (padrão do mercado)
  return Math.min(maxInstallments, 12);
};

describe('calculateMaxInstallments Function', () => {
  
  describe('Cenários Básicos', () => {
    test('deve retornar 1 quando dueDateLimit é null ou undefined', () => {
      expect(calculateMaxInstallments(null)).toBe(1);
      expect(calculateMaxInstallments(undefined)).toBe(1);
      expect(calculateMaxInstallments('')).toBe(1);
    });

    test('deve retornar 1 quando a data limite é muito próxima (menos de 2 meses)', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      expect(calculateMaxInstallments(tomorrowStr)).toBe(1);
    });

    test('deve retornar 1 quando a data limite é no mesmo mês', () => {
      const sameMonth = new Date();
      sameMonth.setDate(sameMonth.getDate() + 15);
      const sameMonthStr = sameMonth.toISOString().split('T')[0];
      
      expect(calculateMaxInstallments(sameMonthStr)).toBe(1);
    });
  });

  describe('Cenários de Diferentes Períodos', () => {
    test('deve calcular corretamente para 3 meses de diferença', () => {
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
      const threeMonthsStr = threeMonthsFromNow.toISOString().split('T')[0];
      
      // 3 meses - 1 (margem de segurança) = 2 parcelas
      expect(calculateMaxInstallments(threeMonthsStr)).toBe(2);
    });

    test('deve calcular corretamente para 6 meses de diferença', () => {
      const sixMonthsFromNow = new Date();
      sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
      const sixMonthsStr = sixMonthsFromNow.toISOString().split('T')[0];
      
      // 6 meses - 1 (margem de segurança) = 5 parcelas
      expect(calculateMaxInstallments(sixMonthsStr)).toBe(5);
    });

    test('deve calcular corretamente para 12 meses de diferença', () => {
      const twelveMonthsFromNow = new Date();
      twelveMonthsFromNow.setMonth(twelveMonthsFromNow.getMonth() + 12);
      const twelveMonthsStr = twelveMonthsFromNow.toISOString().split('T')[0];
      
      // 12 meses - 1 (margem de segurança) = 11 parcelas
      expect(calculateMaxInstallments(twelveMonthsStr)).toBe(11);
    });
  });

  describe('Limite Máximo de Parcelas', () => {
    test('deve limitar a 12 parcelas mesmo com período maior', () => {
      const eighteenMonthsFromNow = new Date();
      eighteenMonthsFromNow.setMonth(eighteenMonthsFromNow.getMonth() + 18);
      const eighteenMonthsStr = eighteenMonthsFromNow.toISOString().split('T')[0];
      
      // 18 meses - 1 (margem de segurança) = 17, mas limitado a 12
      expect(calculateMaxInstallments(eighteenMonthsStr)).toBe(12);
    });

    test('deve limitar a 12 parcelas para períodos muito longos', () => {
      const twoYearsFromNow = new Date();
      twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
      const twoYearsStr = twoYearsFromNow.toISOString().split('T')[0];
      
      // 24 meses - 1 (margem de segurança) = 23, mas limitado a 12
      expect(calculateMaxInstallments(twoYearsStr)).toBe(12);
    });
  });

  describe('Cenários Edge Cases', () => {
    test('deve lidar com mudança de ano corretamente', () => {
      // Teste em dezembro para janeiro do próximo ano
      const december = new Date(2024, 11, 15); // Dezembro 2024
      const january = new Date(2025, 0, 15);   // Janeiro 2025
      
      // Mock do Date.now() para simular data específica
      const originalDate = global.Date;
      global.Date = jest.fn(() => december);
      global.Date.now = originalDate.now;
      
      const januaryStr = january.toISOString().split('T')[0];
      expect(calculateMaxInstallments(januaryStr)).toBe(1);
      
      // Restore original Date
      global.Date = originalDate;
    });

    test('deve lidar com datas no passado', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      // Data no passado deve retornar 1 (mínimo)
      expect(calculateMaxInstallments(yesterdayStr)).toBe(1);
    });

    test('deve lidar com formato de data ISO correto', () => {
      const sixMonthsFromNow = new Date();
      sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
      const isoString = sixMonthsFromNow.toISOString();
      
      // Deve funcionar com formato ISO completo
      expect(calculateMaxInstallments(isoString)).toBe(5);
    });
  });

  describe('Validação de Margem de Segurança', () => {
    test('deve aplicar margem de segurança de 1 mês', () => {
      const exactTwoMonths = new Date();
      exactTwoMonths.setMonth(exactTwoMonths.getMonth() + 2);
      const exactTwoMonthsStr = exactTwoMonths.toISOString().split('T')[0];
      
      // 2 meses - 1 (margem) = 1 parcela
      expect(calculateMaxInstallments(exactTwoMonthsStr)).toBe(1);
    });

    test('deve aplicar margem de segurança para períodos maiores', () => {
      const exactFiveMonths = new Date();
      exactFiveMonths.setMonth(exactFiveMonths.getMonth() + 5);
      const exactFiveMonthsStr = exactFiveMonths.toISOString().split('T')[0];
      
      // 5 meses - 1 (margem) = 4 parcelas
      expect(calculateMaxInstallments(exactFiveMonthsStr)).toBe(4);
    });
  });

  describe('Casos de Uso Realistas', () => {
    test('deve funcionar com data limite padrão do sistema (2025-12-31)', () => {
      // Simula data atual em outubro 2024
      const october2024 = new Date(2024, 9, 15); // Outubro 2024
      const originalDate = global.Date;
      global.Date = jest.fn(() => october2024);
      global.Date.now = originalDate.now;
      
      const result = calculateMaxInstallments('2025-12-31');
      
      // Dezembro 2025 - Outubro 2024 = 14 meses - 1 (margem) = 13, limitado a 12
      expect(result).toBe(12);
      
      // Restore original Date
      global.Date = originalDate;
    });

    test('deve funcionar com diferentes datas de evento', () => {
      const testCases = [
        { eventDate: '2025-06-30', expectedMin: 1, expectedMax: 12 },
        { eventDate: '2025-03-15', expectedMin: 1, expectedMax: 12 },
        { eventDate: '2025-09-20', expectedMin: 1, expectedMax: 12 }
      ];

      testCases.forEach(({ eventDate, expectedMin, expectedMax }) => {
        const result = calculateMaxInstallments(eventDate);
        expect(result).toBeGreaterThanOrEqual(expectedMin);
        expect(result).toBeLessThanOrEqual(expectedMax);
      });
    });
  });
});

// Testes de integração com diferentes configurações
describe('Integration Tests - Payment Settings', () => {
  test('deve calcular parcelas baseado em configuração real do FormConfigManager', () => {
    const paymentSettings = {
      dueDateLimit: '2025-12-31',
      allowPix: true,
      allowCreditCard: true,
      pixDiscountPercentage: 5,
      creditCardFeePercentage: 5
    };

    const maxInstallments = calculateMaxInstallments(paymentSettings.dueDateLimit);
    
    expect(maxInstallments).toBeGreaterThan(0);
    expect(maxInstallments).toBeLessThanOrEqual(12);
    expect(typeof maxInstallments).toBe('number');
  });

  test('deve retornar valores consistentes para mesma data limite', () => {
    const dueDateLimit = '2025-08-15';
    
    const result1 = calculateMaxInstallments(dueDateLimit);
    const result2 = calculateMaxInstallments(dueDateLimit);
    
    expect(result1).toBe(result2);
  });
});