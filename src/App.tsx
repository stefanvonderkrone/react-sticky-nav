import {
  ReactElement,
  FC,
  ReactNode,
  useSyncExternalStore,
  cloneElement,
  useCallback,
} from "react";
import "./App.css";

const useInteractionObserver = (options: IntersectionOb) => {};

class Store<TState> {
  #state: TState;
  #subscriptions: Set<(update: TState) => void> = new Set();

  constructor(initialState: TState) {
    this.#state = initialState;
  }

  getState() {
    return this.#state;
  }

  setState(newState: TState) {
    this.#state = newState;
    const subs = Array.from(this.#subscriptions);
    for (const sub of subs) {
      sub(newState);
    }
  }

  subscribe(observer: (update: TState) => void) {
    this.#subscriptions.add(observer);
    return () => {
      this.#subscriptions.delete(observer);
    };
  }
}

const createStickyNav = <TTarget,>(
  targets: TTarget[],
  initialTarget: TTarget,
) => {
  const store = new Store(initialTarget);
  const useStore = () => {
    return useSyncExternalStore<TTarget>(
      (onUpdate) => store.subscribe(onUpdate),
      () => store.getState(),
    );
  };

  type NavItemChildProps = {
    onClick?: () => void;
    target?: TTarget;
    isActive?: boolean;
  };
  type NavItemChild =
    | ReactElement<NavItemChildProps>
    | ((props: NavItemChildProps) => React.JSX.Element);
  const NavItem: FC<{ target: TTarget; children: NavItemChild }> = ({
    target,
    children,
  }) => {
    const currentTarget = useStore();
    const onClick = useCallback(() => {
      store.setState(target);
      // scroll to element
    }, []);
    return typeof children === "function"
      ? children({
          onClick,
          target,
          isActive: currentTarget === target,
        })
      : cloneElement(children, {
          onClick,
          isActive: currentTarget === target,
          target,
        });
  };

  type TargetChildProps = {
    target?: TTarget;
  };
  type TargetChild =
    | ReactElement<TargetChildProps>
    | ((props: TargetChildProps) => React.JSX.Element);
  const Target: FC<{ target: TTarget; children: TargetChild }> = ({
    target,
    children,
  }) => {
    return typeof children === "function"
      ? children({
          target,
        })
      : cloneElement(children, { target });
  };
  return {
    NavItem,
    Target,
  };
};

export default function App() {
  return (
    <div className="App">
      <nav>
        <ul>
          <li>
            <a href="#anchor-1">Lorem ipsum dolor</a>
          </li>
          <li>
            <a href="#anchor-2">Ut wisi enim ad</a>
          </li>
          <li>
            <a href="#anchor-3">Duis autem vel eum</a>
          </li>
          <li>
            <a href="#anchor-4">Consetetur sadipscing elitr</a>
          </li>
          <li>
            <a href="#anchor-5">Duis autem vel eum</a>
          </li>
        </ul>
      </nav>
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
      <p id="anchor-1">
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
        eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
        voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
        amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
        nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
        sed diam voluptua. At vero eos et accusam et justo duo dolores et ea
        rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem
        ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing
        elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna
        aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo
        dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus
        est Lorem ipsum dolor sit amet.
      </p>
      <p>
        Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse
        molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero
        eros et accumsan et iusto odio dignissim qui blandit praesent luptatum
        zzril delenit augue duis dolore te feugait nulla facilisi. Lorem ipsum
        dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh
        euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.
      </p>
      <p id="anchor-2">
        Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper
        suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem
        vel eum iriure dolor in hendrerit in vulputate velit esse molestie
        consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et
        accumsan et iusto odio dignissim qui blandit praesent luptatum zzril
        delenit augue duis dolore te feugait nulla facilisi.
      </p>
      <p>
        Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet
        doming id quod mazim placerat facer possim assum. Lorem ipsum dolor sit
        amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod
        tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad
        minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis
        nisl ut aliquip ex ea commodo consequat.
      </p>
      <p id="anchor-3">
        Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse
        molestie consequat, vel illum dolore eu feugiat nulla facilisis.
      </p>
      <p>
        At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd
        gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem
        ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
        eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
        voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
        amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, At
        accusam aliquyam diam diam dolore dolores duo eirmod eos erat, et nonumy
        sed tempor et et invidunt justo labore Stet clita ea et gubergren, kasd
        magna no rebum. sanctus sea sed takimata ut vero voluptua. est Lorem
        ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing
        elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna
        aliquyam erat.
      </p>
      <p id="anchor-4">
        Consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
        labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
        accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no
        sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor
        sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
        invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At
        vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd
        gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem
        ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
        eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
        voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
        clita kasd gubergren, no sea takimata sanctus.
      </p>
      <p>
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
        eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
        voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
        amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
        nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
        sed diam voluptua. At vero eos et accusam et justo duo dolores et ea
        rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem
        ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing
        elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna
        aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo
        dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus
        est Lorem ipsum dolor sit amet.
      </p>
      <p id="anchor-5">
        Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse
        molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero
        eros et accumsan et iusto odio dignissim qui blandit praesent luptatum
        zzril delenit augue duis dolore te feugait nulla facilisi. Lorem ipsum
        dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh
        euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.
      </p>
      <p>
        Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper
        suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem
        vel eum iriure dolor in hendrerit in vulputate velit esse molestie
        consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et
        accumsan et iusto odio dignissim qui blandit praesent luptatum zzril
        delenit augue duis dolore te feugait nulla facilisi.
      </p>
    </div>
  );
}
