import Matter from 'matter-js';
import { fetchPlayerStats } from './playerStats';
import type { SimulationPlayer, PlayerStats, Team, Position } from '../types';

const FIELD_WIDTH = 1600;
const FIELD_HEIGHT = 1100;
const PLAYER_RADIUS = 15;
const BALL_RADIUS = 10;
const FRICTION = 0.05;
const MAX_SPEED = 10;
const FORCE_MULTIPLIER = 0.0005;

// Field boundaries (adjusted to match white lines)
const FIELD_BOUNDS = {
  LEFT: 50,
  RIGHT: 1550,
  TOP: 50,
  BOTTOM: 1050
};

export class SimulationEngine {
  private engine: Matter.Engine;
  private world: Matter.World;
  private players: Map<string, SimulationPlayer[]>;
  private ball: Matter.Body;
  private boundaries: Matter.Body[];
  private lastUpdate: number;

  constructor() {
    console.log('SimulationEngine constructor called');
    this.engine = Matter.Engine.create({
      gravity: { x: 0, y: 0 },
    });
    this.world = this.engine.world;
    this.players = new Map();
    this.lastUpdate = Date.now();

    // Create ball with higher restitution and lower friction
    this.ball = Matter.Bodies.circle(FIELD_WIDTH / 2, FIELD_HEIGHT / 2, BALL_RADIUS, {
      friction: 0.01,
      restitution: 0.8,
      density: 0.001,
      label: 'ball',
      collisionFilter: {
        category: 0x0002,
      }
    });

    // Create field boundaries matching the white lines
    this.boundaries = [
      // Top boundary
      Matter.Bodies.rectangle(FIELD_WIDTH / 2, FIELD_BOUNDS.TOP, FIELD_BOUNDS.RIGHT - FIELD_BOUNDS.LEFT, 2, {
        isStatic: true,
        render: { visible: false },
        collisionFilter: { mask: 0x0002 }
      }),
      // Bottom boundary
      Matter.Bodies.rectangle(FIELD_WIDTH / 2, FIELD_BOUNDS.BOTTOM, FIELD_BOUNDS.RIGHT - FIELD_BOUNDS.LEFT, 2, {
        isStatic: true,
        render: { visible: false },
        collisionFilter: { mask: 0x0002 }
      }),
      // Left boundary
      Matter.Bodies.rectangle(FIELD_BOUNDS.LEFT, FIELD_HEIGHT / 2, 2, FIELD_BOUNDS.BOTTOM - FIELD_BOUNDS.TOP, {
        isStatic: true,
        render: { visible: false },
        collisionFilter: { mask: 0x0002 }
      }),
      // Right boundary
      Matter.Bodies.rectangle(FIELD_BOUNDS.RIGHT, FIELD_HEIGHT / 2, 2, FIELD_BOUNDS.BOTTOM - FIELD_BOUNDS.TOP, {
        isStatic: true,
        render: { visible: false },
        collisionFilter: { mask: 0x0002 }
      })
    ];

    Matter.World.add(this.world, [this.ball, ...this.boundaries]);
    console.log('SimulationEngine initialized with ball and boundaries');

    // Add collision handling
    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;
        
        if (bodyA.label === 'ball' || bodyB.label === 'ball') {
          const ball = bodyA.label === 'ball' ? bodyA : bodyB;
          const velocity = ball.velocity;
          
          // Apply slight random variation to bounce
          Matter.Body.setVelocity(ball, {
            x: velocity.x * (0.95 + Math.random() * 0.1),
            y: velocity.y * (0.95 + Math.random() * 0.1)
          });
        }
      });
    });
  }

  public getBallPosition(): { x: number; y: number } {
    return this.ball.position;
  }

  public getTeamPositions(teamId: string): Position[] {
    const players = this.players.get(teamId) || [];
    return players.map(player => ({
      x: (player.body!.position.x / FIELD_WIDTH) * 100,
      y: (player.body!.position.y / FIELD_HEIGHT) * 100,
      role: player.role,
      number: player.number
    }));
  }

  private createPlayerBody(x: number, y: number, stats: PlayerStats): Matter.Body {
    console.log('Creating player body at', { x, y }, 'with stats', stats);
    return Matter.Bodies.circle(x, y, PLAYER_RADIUS, {
      friction: FRICTION,
      restitution: 0.2,
      density: 0.002 * stats.strength / 100,
      label: 'player',
      collisionFilter: {
        category: 0x0001,
        mask: 0x0001 | 0x0002 // Players can collide with other players and the ball
      }
    });
  }

  public async initializeTeams(teams: Team[]): Promise<void> {
    console.log('Initializing teams', teams);
    for (const team of teams) {
      const simulationPlayers: SimulationPlayer[] = [];
      
      for (const pos of team.formation.positions) {
        console.log('Fetching stats for position', pos);
        const stats = await fetchPlayerStats(pos.role);
        const x = (pos.x / 100) * FIELD_WIDTH;
        const y = (pos.y / 100) * FIELD_HEIGHT;
        
        const body = this.createPlayerBody(x, y, stats);
        Matter.World.add(this.world, [body]);

        simulationPlayers.push({
          ...pos,
          stats,
          body,
          velocity: { x: 0, y: 0 },
          lastPosition: { x, y },
        });
      }

      this.players.set(team.id, simulationPlayers);
    }
    console.log('Teams initialized', this.players);
  }

  public update(): void {
    console.log('SimulationEngine.update called');
    const currentTime = Date.now();
    const deltaTime = currentTime - this.lastUpdate;
    this.lastUpdate = currentTime;

    Matter.Engine.update(this.engine, deltaTime);

    // Keep ball within bounds
    const ballPos = this.ball.position;
    if (ballPos.x < FIELD_BOUNDS.LEFT || ballPos.x > FIELD_BOUNDS.RIGHT ||
        ballPos.y < FIELD_BOUNDS.TOP || ballPos.y > FIELD_BOUNDS.BOTTOM) {
      Matter.Body.setPosition(this.ball, {
        x: Math.max(FIELD_BOUNDS.LEFT, Math.min(FIELD_BOUNDS.RIGHT, ballPos.x)),
        y: Math.max(FIELD_BOUNDS.TOP, Math.min(FIELD_BOUNDS.BOTTOM, ballPos.y))
      });
    }

    // Apply random force to ball occasionally
    if (Math.random() < 0.02) {
      const force = {
        x: (Math.random() - 0.5) * 0.001,
        y: (Math.random() - 0.5) * 0.001
      };
      Matter.Body.applyForce(this.ball, this.ball.position, force);
    }

    this.players.forEach((players, teamId) => {
      players.forEach(player => {
        if (!player.body) return;

        const pos = player.body.position;
        player.x = (pos.x / FIELD_WIDTH) * 100;
        player.y = (pos.y / FIELD_HEIGHT) * 100;

        const dx = pos.x - player.lastPosition.x;
        const dy = pos.y - player.lastPosition.y;
        player.velocity = {
          x: dx / deltaTime,
          y: dy / deltaTime,
        };

        player.lastPosition = { x: pos.x, y: pos.y };

        this.applyAIBehavior(player, teamId);
      });
    });
  }

  private applyAIBehavior(player: SimulationPlayer, teamId: string): void {
    if (!player.body) return;

    const ballPos = this.ball.position;
    const playerPos = player.body.position;

    const dx = ballPos.x - playerPos.x;
    const dy = ballPos.y - playerPos.y;
    const distToBall = Math.sqrt(dx * dx + dy * dy);

    let force = { x: 0, y: 0 };

    switch (player.role) {
      case 'GK':
        force = this.calculateGoalkeeperMovement(player, teamId);
        break;
      case 'CB':
      case 'LCB':
      case 'RCB':
        force = this.calculateDefenderMovement(player, teamId);
        break;
      default:
        force = this.calculateFieldPlayerMovement(player, teamId, distToBall);
    }

    const speedFactor = player.stats.speed / 100;
    const maxForce = MAX_SPEED * speedFactor * FORCE_MULTIPLIER;
    force.x = Math.max(-maxForce, Math.min(maxForce, force.x));
    force.y = Math.max(-maxForce, Math.min(maxForce, force.y));

    Matter.Body.applyForce(player.body, player.body.position, force);
  }

  private calculateGoalkeeperMovement(player: SimulationPlayer, teamId: string): Matter.Vector {
    const ballPos = this.ball.position;
    const playerPos = player.body!.position;
    const isTeamA = teamId === '1';
    
    const goalX = isTeamA ? FIELD_BOUNDS.LEFT + 50 : FIELD_BOUNDS.RIGHT - 50;
    const goalY = FIELD_HEIGHT / 2;

    const distToBall = Matter.Vector.magnitude(Matter.Vector.sub(ballPos, playerPos));
    const distToGoal = Matter.Vector.magnitude(Matter.Vector.sub({ x: goalX, y: goalY }, playerPos));

    if (distToBall < 200 && distToGoal < 150) {
      const force = Matter.Vector.sub(ballPos, playerPos);
      return Matter.Vector.mult(Matter.Vector.normalise(force), 0.0003);
    } else {
      const force = Matter.Vector.sub({ x: goalX, y: goalY }, playerPos);
      return Matter.Vector.mult(Matter.Vector.normalise(force), 0.0002);
    }
  }

  private calculateDefenderMovement(player: SimulationPlayer, teamId: string): Matter.Vector {
    const ballPos = this.ball.position;
    const playerPos = player.body!.position;
    const isTeamA = teamId === '1';
    
    const defenseX = isTeamA ? FIELD_WIDTH * 0.2 : FIELD_WIDTH * 0.8;
    
    if ((isTeamA && ballPos.x < FIELD_WIDTH * 0.3) || (!isTeamA && ballPos.x > FIELD_WIDTH * 0.7)) {
      const force = Matter.Vector.sub(ballPos, playerPos);
      return Matter.Vector.mult(Matter.Vector.normalise(force), 0.0004);
    } else {
      const targetPos = { x: defenseX, y: playerPos.y };
      const force = Matter.Vector.sub(targetPos, playerPos);
      return Matter.Vector.mult(Matter.Vector.normalise(force), 0.0002);
    }
  }

  private calculateFieldPlayerMovement(
    player: SimulationPlayer,
    teamId: string,
    distToBall: number
  ): Matter.Vector {
    const ballPos = this.ball.position;
    const playerPos = player.body!.position;
    const isTeamA = teamId === '1';

    const baseX = isTeamA ? 
      (player.role.includes('ST') ? FIELD_WIDTH * 0.8 : FIELD_WIDTH * 0.5) :
      (player.role.includes('ST') ? FIELD_WIDTH * 0.2 : FIELD_WIDTH * 0.5);
    
    const baseY = player.y * (FIELD_HEIGHT / 100);

    if (distToBall < 200) {
      const force = Matter.Vector.sub(ballPos, playerPos);
      return Matter.Vector.mult(Matter.Vector.normalise(force), 0.0005);
    } else {
      const targetPos = { x: baseX, y: baseY };
      const force = Matter.Vector.sub(targetPos, playerPos);
      return Matter.Vector.mult(Matter.Vector.normalise(force), 0.0003);
    }
  }

  public cleanup(): void {
    Matter.Engine.clear(this.engine);
    Matter.World.clear(this.world, false);
  }
}