export type Deps = Record<string, any>;

export interface DependencyContainer<Dependencies extends Deps> {
  subscribers(): Array<keyof Dependencies>;

  dependencies: Dependencies;
}
