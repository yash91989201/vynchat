/**
 * Realtime connection monitoring and error handling utilities
 */

export interface ConnectionMetrics {
  totalConnections: number;
  activeConnections: number;
  failedConnections: number;
  reconnectAttempts: number;
  averageResponseTime: number;
  lastError?: string;
  lastErrorTime?: Date;
}

export interface ConnectionState {
  status: 'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting';
  lastConnected?: Date;
  lastDisconnected?: Date;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
}

export class RealtimeMonitor {
  private static instance: RealtimeMonitor;
  private metrics: ConnectionMetrics = {
    totalConnections: 0,
    activeConnections: 0,
    failedConnections: 0,
    reconnectAttempts: 0,
    averageResponseTime: 0,
  };
  private connectionStates: Map<string, ConnectionState> = new Map();
  private responseTimes: number[] = [];
  private maxResponseTimeSamples = 100;

  private constructor() {}

  static getInstance(): RealtimeMonitor {
    if (!RealtimeMonitor.instance) {
      RealtimeMonitor.instance = new RealtimeMonitor();
    }
    return RealtimeMonitor.instance;
  }

  /**
   * Record a connection attempt
   */
  recordConnectionAttempt(connectionId: string): void {
    this.metrics.totalConnections++;
    this.connectionStates.set(connectionId, {
      status: 'connecting',
      reconnectAttempts: 0,
      maxReconnectAttempts: 10,
    });
  }

  /**
   * Record a successful connection
   */
  recordConnectionSuccess(connectionId: string, responseTime?: number): void {
    const state = this.connectionStates.get(connectionId);
    if (state) {
      state.status = 'connected';
      state.lastConnected = new Date();
      state.reconnectAttempts = 0; // Reset on successful connection
    }

    this.metrics.activeConnections++;
    
    if (responseTime) {
      this.recordResponseTime(responseTime);
    }

    console.log(`✅ Connection successful: ${connectionId}`);
  }

  /**
   * Record a connection failure
   */
  recordConnectionFailure(connectionId: string, error: string): void {
    const state = this.connectionStates.get(connectionId);
    if (state) {
      state.status = 'error';
      state.lastDisconnected = new Date();
    }

    this.metrics.failedConnections++;
    this.metrics.lastError = error;
    this.metrics.lastErrorTime = new Date();

    console.error(`❌ Connection failed: ${connectionId} - ${error}`);
  }

  /**
   * Record a disconnection
   */
  recordDisconnection(connectionId: string): void {
    const state = this.connectionStates.get(connectionId);
    if (state) {
      state.status = 'disconnected';
      state.lastDisconnected = new Date();
    }

    this.metrics.activeConnections = Math.max(0, this.metrics.activeConnections - 1);
    console.log(`🔌 Disconnected: ${connectionId}`);
  }

  /**
   * Record a reconnection attempt
   */
  recordReconnectionAttempt(connectionId: string): boolean {
    const state = this.connectionStates.get(connectionId);
    if (!state) return false;

    state.reconnectAttempts++;
    this.metrics.reconnectAttempts++;
    state.status = 'reconnecting';

    // Check if we've exceeded max reconnection attempts
    if (state.reconnectAttempts >= state.maxReconnectAttempts) {
      console.error(`🚫 Max reconnection attempts exceeded for ${connectionId}`);
      return false;
    }

    console.log(`🔄 Reconnection attempt ${state.reconnectAttempts}/${state.maxReconnectAttempts} for ${connectionId}`);
    return true;
  }

  /**
   * Record response time for performance monitoring
   */
  private recordResponseTime(responseTime: number): void {
    this.responseTimes.push(responseTime);
    
    // Keep only the last N samples
    if (this.responseTimes.length > this.maxResponseTimeSamples) {
      this.responseTimes.shift();
    }

    // Update average
    this.metrics.averageResponseTime = this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length;
  }

  /**
   * Check if a connection should be reconnected based on error patterns
   */
  shouldReconnect(connectionId: string, error: string): boolean {
    const state = this.connectionStates.get(connectionId);
    if (!state) return true;

    // Don't reconnect if we've hit max attempts
    if (state.reconnectAttempts >= state.maxReconnectAttempts) {
      return false;
    }

    // Check error patterns that shouldn't trigger reconnection
    const noReconnectErrors = [
      'AUTH_INVALID',
      'TENANT_NOT_FOUND', 
      'UNAUTHORIZED',
      'FORBIDDEN',
    ];

    const shouldNotReconnect = noReconnectErrors.some(pattern => 
      error.toUpperCase().includes(pattern)
    );

    return !shouldNotReconnect;
  }

  /**
   * Get current metrics
   */
  getMetrics(): ConnectionMetrics {
    return { ...this.metrics };
  }

  /**
   * Get connection state for a specific connection
   */
  getConnectionState(connectionId: string): ConnectionState | undefined {
    return this.connectionStates.get(connectionId);
  }

  /**
   * Get all connection states
   */
  getAllConnectionStates(): Map<string, ConnectionState> {
    return new Map(this.connectionStates);
  }

  /**
   * Clean up old connection states
   */
  cleanup(): void {
    const now = new Date();
    const staleThreshold = 5 * 60 * 1000; // 5 minutes

    for (const [connectionId, state] of this.connectionStates.entries()) {
      const lastActivity = state.lastDisconnected || state.lastConnected;
      if (lastActivity && (now.getTime() - lastActivity.getTime()) > staleThreshold) {
        this.connectionStates.delete(connectionId);
      }
    }
  }

  /**
   * Log current status for monitoring
   */
  logStatus(): void {
    console.log('📊 Realtime Connection Monitor Status:');
    console.log(`  Total Connections: ${this.metrics.totalConnections}`);
    console.log(`  Active Connections: ${this.metrics.activeConnections}`);
    console.log(`  Failed Connections: ${this.metrics.failedConnections}`);
    console.log(`  Reconnect Attempts: ${this.metrics.reconnectAttempts}`);
    console.log(`  Average Response Time: ${Math.round(this.metrics.averageResponseTime)}ms`);
    
    if (this.metrics.lastError) {
      console.log(`  Last Error: ${this.metrics.lastError} at ${this.metrics.lastErrorTime?.toISOString()}`);
    }

    const statusCounts = new Map<string, number>();
    for (const state of this.connectionStates.values()) {
      const count = statusCounts.get(state.status) || 0;
      statusCounts.set(state.status, count + 1);
    }

    console.log('  Connection Status Breakdown:');
    for (const [status, count] of statusCounts.entries()) {
      console.log(`    ${status}: ${count}`);
    }
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.metrics = {
      totalConnections: 0,
      activeConnections: 0,
      failedConnections: 0,
      reconnectAttempts: 0,
      averageResponseTime: 0,
    };
    this.connectionStates.clear();
    this.responseTimes = [];
  }
}

export const realtimeMonitor = RealtimeMonitor.getInstance();

/**
 * Utility function to create exponential backoff with jitter
 */
export function createExponentialBackoff(baseDelay: number, maxDelay: number) {
  return function(attempt: number): number {
    const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
    const jitter = Math.random() * 0.3 * exponentialDelay; // 30% jitter
    return exponentialDelay + jitter;
  };
}

/**
 * Utility function to measure operation time
 */
export async function measureTime<T>(operation: () => Promise<T>): Promise<[T, number]> {
  const startTime = Date.now();
  const result = await operation();
  const responseTime = Date.now() - startTime;
  return [result, responseTime];
}