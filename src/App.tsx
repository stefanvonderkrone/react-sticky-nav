import {
  ReactElement,
  FC,
  useSyncExternalStore,
  cloneElement,
  useCallback,
  useState,
  useEffect,
  MouseEventHandler,
  ReactNode,
} from "react";
import "./App.css";

const useInteractionObserver = (
  options: IntersectionObserverInit,
  callback: (entrie: IntersectionObserverEntry) => void,
) => {
  const [element, setElement] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (element) {
      const observer = new IntersectionObserver(([entry]) => {
        callback(entry);
      }, options);
      observer.observe(element);
      return () => {
        observer.unobserve(element);
        observer.disconnect();
      };
    }
  }, [element, callback, options]);
  return setElement;
};

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

const createStickyNav = <TTarget,>(initialTarget: TTarget) => {
  const targetStore = new Store(initialTarget);
  const refsStore = new Store<Map<TTarget, HTMLElement>>(new Map());
  const useCurrentTarget = () => {
    return useSyncExternalStore<TTarget>(
      (onUpdate) => targetStore.subscribe(onUpdate),
      () => targetStore.getState(),
    );
  };
  const useAvailableRef = (target: TTarget) => {
    return useSyncExternalStore(
      (onUpdate) => {
        return refsStore.subscribe(() => {
          onUpdate();
        });
      },
      () => refsStore.getState().has(target),
    );
  };

  type NavItemChildProps = {
    onClick?: () => void;
    target?: TTarget;
    isActive?: boolean;
    isAvailable?: boolean;
  };
  type NavItemChild =
    | ReactElement<NavItemChildProps>
    | ((props: Required<NavItemChildProps>) => React.JSX.Element);
  const NavItem: FC<{ target: TTarget; children: NavItemChild }> = ({
    target,
    children,
  }) => {
    const currentTarget = useCurrentTarget();
    const onClick = useCallback(() => {
      targetStore.setState(target);
      const element = refsStore.getState().get(target);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
        });
      }
    }, [target]);
    const isAvailable = useAvailableRef(target);
    const props: Required<NavItemChildProps> = {
      onClick,
      target,
      isActive: currentTarget === target,
      isAvailable,
    };
    return typeof children === "function"
      ? children(props)
      : cloneElement(children, props);
  };

  type TargetChildProps = {
    target?: TTarget;
    elementRef?: (element: HTMLElement | null) => void;
  };
  type TargetChild =
    | ReactElement<TargetChildProps>
    | ((props: Required<TargetChildProps>) => React.JSX.Element);
  const Target: FC<{ target: TTarget; children: TargetChild }> = ({
    target,
    children,
  }) => {
    const observerRef = useInteractionObserver(
      {},
      useCallback(
        (entry: IntersectionObserverEntry) => {
          if (entry.isIntersecting) {
            targetStore.setState(target);
          }
        },
        [target],
      ),
    );
    const elementRef = useCallback(
      (element: HTMLElement | null) => {
        observerRef(element);
        const refs = new Map(refsStore.getState());
        if (element) {
          refs.set(target, element);
        } else {
          refs.delete(target);
        }
        refsStore.setState(refs);
      },
      [target, observerRef],
    );
    const props: Required<TargetChildProps> = {
      target,
      elementRef,
    };
    return typeof children === "function"
      ? children(props)
      : cloneElement(children, props);
  };
  return {
    NavItem,
    Target,
  };
};

enum StickyNavTarget {
  Anchor0 = "anchor-0",
  Anchor1 = "anchor-1",
  Anchor2 = "anchor-2",
  Anchor3 = "anchor-3",
  Anchor4 = "anchor-4",
  Anchor5 = "anchor-5",
}

const stickyNav = createStickyNav(StickyNavTarget.Anchor0);

const ListEntry: FC<{
  children: ReactNode;
  isActive?: boolean;
  isAvailable?: boolean;
  target?: StickyNavTarget;
  onClick?: () => void;
  href: string;
}> = ({ href, children, onClick, isActive = false, isAvailable = false }) => {
  const handleClick = useCallback<MouseEventHandler<HTMLElement>>(
    (e) => {
      e.preventDefault();
      onClick?.();
    },
    [onClick],
  );
  return (
    <li className={isActive ? "active" : !isAvailable ? "disabled" : ""}>
      <a href={href} onClick={handleClick}>
        {children}
      </a>
    </li>
  );
};

export default function App() {
  return (
    <div className="App">
      <nav>
        <ul>
          <stickyNav.NavItem target={StickyNavTarget.Anchor1}>
            <ListEntry href="#anchor-1">Lorem ipsum dolor</ListEntry>
          </stickyNav.NavItem>
          <stickyNav.NavItem target={StickyNavTarget.Anchor2}>
            <ListEntry href="#anchor-2">Ut wisi enim ad</ListEntry>
          </stickyNav.NavItem>
          <stickyNav.NavItem target={StickyNavTarget.Anchor3}>
            <ListEntry href="#anchor-3">Duis autem vel eum</ListEntry>
          </stickyNav.NavItem>
          <stickyNav.NavItem target={StickyNavTarget.Anchor4}>
            <ListEntry href="#anchor-4">Consetetur sadipscing elitr</ListEntry>
          </stickyNav.NavItem>
          <stickyNav.NavItem target={StickyNavTarget.Anchor5}>
            <ListEntry href="#anchor-5">Duis autem vel eum</ListEntry>
          </stickyNav.NavItem>
        </ul>
      </nav>
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
      <stickyNav.Target target={StickyNavTarget.Anchor1}>
        {(props) => <div id={props.target} ref={props.elementRef} />}
      </stickyNav.Target>
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
      {/* <stickyNav.Target target={StickyNavTarget.Anchor2}>
        {(props) => <div id={props.target} ref={props.elementRef} />}
      </stickyNav.Target> */}
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
      <stickyNav.Target target={StickyNavTarget.Anchor3}>
        {(props) => <div id={props.target} ref={props.elementRef} />}
      </stickyNav.Target>
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
      <stickyNav.Target target={StickyNavTarget.Anchor4}>
        {(props) => <div id={props.target} ref={props.elementRef} />}
      </stickyNav.Target>
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
      <stickyNav.Target target={StickyNavTarget.Anchor5}>
        {(props) => <div id={props.target} ref={props.elementRef} />}
      </stickyNav.Target>
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
