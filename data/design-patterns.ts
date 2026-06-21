export const phases = [
  {
    id: 1,
    label: "Phase 1",
    duration: "Week 1–2",
    title: "Creational Patterns",
    subtitle: "How objects are born",
    color: "#E8FF47",
    accent: "#1a1a1a",
    patterns: [
      {
        name: "Singleton",
        tag: "🔒",
        asked: ["Amazon", "Flipkart", "Uber", "Microsoft"],
        concept:
          "One instance to rule them all. Thread safety is the hidden trap.",
        problems: [
          {
            title: "Logger Service",
            difficulty: "Easy",
            what: "Build a thread-safe Logger that ensures only one instance writes logs across an entire app. Handle concurrent log() calls.",
            patterns_used: ["Singleton"],
            companies: ["Amazon", "Flipkart"],
            hint: "Naive singleton fails in multi-threading. Use double-checked locking or enum-based singleton in Java.",
            java_sketch: `public class Logger {
  private static volatile Logger instance;
  private Logger() {}

  
  public static Logger getInstance() {
    if (instance == null) {
      synchronized (Logger.class) {
        if (instance == null) {
          instance = new Logger();
        }
      }
    }
    return instance;
  }
  public void log(String msg) { /* write to file */ }
}`,
          },
          {
            title: "Database Connection Pool",
            difficulty: "Medium",
            what: "Design a ConnectionPool that creates at most N DB connections, reuses them, and blocks callers when all are busy.",
            patterns_used: ["Singleton", "Object Pool"],
            companies: ["Google", "Microsoft"],
            hint: "Pool is singleton; connections are recycled. BlockingQueue<Connection> is your friend.",
            java_sketch: `// Singleton pool holding N reusable connections
public class ConnectionPool {
  private static ConnectionPool instance;
  private BlockingQueue<Connection> pool;
  
  private ConnectionPool(int size) {
    pool = new ArrayBlockingQueue<>(size);
    for (int i = 0; i < size; i++)
      pool.offer(new Connection());
  }
  public Connection acquire() throws InterruptedException {
    return pool.take(); // blocks if empty
  }
  public void release(Connection c) { pool.offer(c); }
}`,
          },
        ],
      },
      {
        name: "Factory Method",
        tag: "🏭",
        asked: ["Amazon", "Google", "Flipkart", "Meesho"],
        concept:
          "Let subclasses decide what to instantiate. Decouple creation from use.",
        problems: [
          {
            title: "Notification System",
            difficulty: "Easy",
            what: "Build a NotificationFactory that creates SMS, Email, or Push notifications based on user preference. Adding a new channel should not touch existing code.",
            patterns_used: ["Factory Method"],
            companies: ["Uber", "Amazon"],
            hint: "Define a Notification interface. Each channel is a subclass. Factory reads a config/enum to decide which to create.",
            java_sketch: `interface Notification { void send(String msg); }
class SMSNotification implements Notification { ... }
class EmailNotification implements Notification { ... }

class NotificationFactory {
  public static Notification create(String type) {
    return switch (type) {
      case "SMS"   -> new SMSNotification();
      case "EMAIL" -> new EmailNotification();
      default -> throw new IllegalArgumentException();
    };
  }
}`,
          },
          {
            title: "Chess Piece Factory",
            difficulty: "Medium",
            what: "Design a Chess game. Each piece type (King, Queen, Pawn…) is created by a factory. Combine with Strategy for movement rules.",
            patterns_used: ["Factory Method", "Strategy", "Singleton"],
            companies: ["Flipkart", "Google"],
            hint: "ChessPieceFactory is a Singleton. Each piece holds a MoveStrategy. Factory + Strategy is the classic combo here.",
            java_sketch: `interface MoveStrategy { boolean canMove(int fromR, int fromC, int toR, int toC); }
class DiagonalMove implements MoveStrategy { ... }
class StraightMove implements MoveStrategy { ... }

abstract class Piece { MoveStrategy moveStrategy; }
class Bishop extends Piece {
  Bishop() { this.moveStrategy = new DiagonalMove(); }
}`,
          },
        ],
      },
      {
        name: "Abstract Factory",
        tag: "🧩",
        asked: ["Google", "Meta", "Microsoft"],
        concept:
          "Factory of factories. Create families of related objects without specifying concrete classes.",
        problems: [
          {
            title: "UI Component Toolkit",
            difficulty: "Medium",
            what: "Design a cross-platform UI library. MacUI produces Mac-styled Button, Checkbox, Dialog. WindowsUI does the same. Client code never knows which platform.",
            patterns_used: ["Abstract Factory"],
            companies: ["Microsoft", "Google"],
            hint: "UIFactory interface has createButton(), createCheckbox(). MacFactory and WindowsFactory implement it. Client uses only the interface.",
            java_sketch: `interface UIFactory {
  Button createButton();
  Checkbox createCheckbox();
}
class MacFactory implements UIFactory {
  public Button createButton() { return new MacButton(); }
  public Checkbox createCheckbox() { return new MacCheckbox(); }
}`,
          },
        ],
      },
      {
        name: "Builder",
        tag: "🔧",
        asked: ["Amazon", "Flipkart", "Swiggy", "Uber"],
        concept:
          "Construct complex objects step-by-step. Avoid telescoping constructors.",
        problems: [
          {
            title: "Pizza / Burger Order Builder",
            difficulty: "Easy",
            what: "Build an Order system for Swiggy/Zomato. Orders have optional fields (toppings, size, crust, extras). Use Builder to avoid a constructor with 10 parameters.",
            patterns_used: ["Builder"],
            companies: ["Swiggy", "Zomato"],
            hint: "Inner static Builder class. Each setter returns 'this'. Terminal build() validates and creates the Product.",
            java_sketch: `class Pizza {
  private String size, crust;
  private List<String> toppings;
  
  private Pizza(Builder b) { this.size = b.size; ... }
  
  static class Builder {
    String size; String crust = "thin";
    List<String> toppings = new ArrayList<>();
    
    Builder size(String s) { this.size = s; return this; }
    Builder crust(String c) { this.crust = c; return this; }
    Builder addTopping(String t) { toppings.add(t); return this; }
    Pizza build() { return new Pizza(this); }
  }
}`,
          },
          {
            title: "HTTP Request Builder",
            difficulty: "Medium",
            what: "Model Java's OkHttp/HttpRequest. Build a Request object with method, URL, headers, body, timeout. Some fields are required, some optional.",
            patterns_used: ["Builder"],
            companies: ["Google", "Uber"],
            hint: "Required fields go in Builder constructor. Optional fields as fluent setters. build() throws if required fields missing.",
            java_sketch: null,
          },
        ],
      },
      {
        name: "Prototype",
        tag: "🧬",
        asked: ["Microsoft", "Adobe"],
        concept:
          "Clone existing objects instead of creating new ones from scratch.",
        problems: [
          {
            title: "Document Template Cloner",
            difficulty: "Easy",
            what: "Design a document editor where users can clone template documents (Invoice, Report, Contract). Deep copy is required — nested objects must not be shared.",
            patterns_used: ["Prototype"],
            companies: ["Adobe", "Microsoft"],
            hint: "Implement Cloneable or a copy constructor. Pay attention to deep vs shallow copy — nested lists/maps need explicit copying.",
            java_sketch: null,
          },
        ],
      },
    ],
  },
  {
    id: 2,
    label: "Phase 2",
    duration: "Week 3–4",
    title: "Structural Patterns",
    subtitle: "How classes fit together",
    color: "#47C8FF",
    accent: "#0a0a1a",
    patterns: [
      {
        name: "Adapter",
        tag: "🔌",
        asked: ["Amazon", "Flipkart", "Microsoft"],
        concept:
          "Make incompatible interfaces work together without changing existing code.",
        problems: [
          {
            title: "Payment Gateway Adapter",
            difficulty: "Medium",
            what: "Your app uses a PaymentProcessor interface. Integrate a legacy RazorpayClient that has a completely different API. Write an adapter — no legacy code modification allowed.",
            patterns_used: ["Adapter"],
            companies: ["Razorpay", "Amazon Pay"],
            hint: "Adapter implements your target interface, internally delegates to the Adaptee. Classic 'wrapper' pattern.",
            java_sketch: `interface PaymentProcessor { void pay(double amount, String currency); }
class RazorpayClient { void makePayment(int amountInPaise, String cur) { ... } }

class RazorpayAdapter implements PaymentProcessor {
  private RazorpayClient client;
  public void pay(double amount, String currency) {
    client.makePayment((int)(amount * 100), currency);
  }
}`,
          },
        ],
      },
      {
        name: "Decorator",
        tag: "🎨",
        asked: ["Google", "Amazon", "Flipkart", "Uber"],
        concept:
          "Add behavior dynamically by wrapping objects. Alternative to inheritance explosion.",
        problems: [
          {
            title: "Coffee Shop (Beverage Decorator)",
            difficulty: "Easy",
            what: "Model Starbucks. BaseCoffee has a cost. Decorators (Milk, Sugar, Caramel, Whip) add cost and description. Any combination must work without subclassing per combo.",
            patterns_used: ["Decorator"],
            companies: ["Classic interview problem"],
            hint: "Both base and decorator implement the same Beverage interface. Decorator wraps another Beverage. cost() calls wrapped.cost() + own cost.",
            java_sketch: `interface Beverage { double cost(); String description(); }
class Espresso implements Beverage { ... }

abstract class CondimentDecorator implements Beverage {
  protected Beverage wrapped;
  CondimentDecorator(Beverage b) { this.wrapped = b; }
}
class Milk extends CondimentDecorator {
  public double cost() { return wrapped.cost() + 0.5; }
}`,
          },
          {
            title: "Logging/Auth Middleware Decorator",
            difficulty: "Medium",
            what: "Build a REST handler pipeline. Wrap a base RequestHandler with LoggingDecorator, then AuthDecorator, then RateLimitDecorator. Each adds cross-cutting behavior.",
            patterns_used: ["Decorator", "Chain of Responsibility"],
            companies: ["Uber", "Google"],
            hint: "Decorator and Chain of Responsibility look similar — Decorator adds behavior, CoR decides whether to pass forward.",
            java_sketch: null,
          },
        ],
      },
      {
        name: "Facade",
        tag: "🪟",
        asked: ["Amazon", "Google", "Flipkart"],
        concept: "Simplify a complex subsystem with a single clean interface.",
        problems: [
          {
            title: "Home Theater Facade",
            difficulty: "Easy",
            what: "A Home Theater has 7 subsystems. Build a HomeTheaterFacade with watchMovie() and endMovie() that orchestrates all subsystems.",
            patterns_used: ["Facade"],
            companies: ["Classic interview problem"],
            hint: "Facade doesn't restrict access to subsystems — it just provides a simpler path.",
            java_sketch: null,
          },
          {
            title: "Order Placement Facade",
            difficulty: "Medium",
            what: "E-commerce order placement involves InventoryService, PaymentService, ShippingService, NotificationService. Expose a single OrderFacade.placeOrder().",
            patterns_used: ["Facade"],
            companies: ["Amazon", "Flipkart"],
            hint: "Facade coordinates, doesn't own business logic. Each subsystem remains independently testable.",
            java_sketch: `class OrderFacade {
  private InventoryService inv;
  private PaymentService pay;
  private ShippingService ship;
  private NotificationService notify;
  
  public Order placeOrder(Cart cart, PaymentInfo pi) {
    inv.reserve(cart.items());
    pay.charge(pi, cart.total());
    var order = ship.schedule(cart.address());
    notify.sendConfirmation(cart.userId(), order.id());
    return order;
  }
}`,
          },
        ],
      },
      {
        name: "Proxy",
        tag: "🛡️",
        asked: ["Google", "Amazon", "Netflix"],
        concept:
          "Control access to another object — for caching, lazy loading, access control, or logging.",
        problems: [
          {
            title: "Caching Image Proxy",
            difficulty: "Easy",
            what: "Load high-resolution images lazily. ProxyImage caches the real image after first load. Subsequent calls return cached version without hitting disk/network.",
            patterns_used: ["Proxy (Virtual)"],
            companies: ["Adobe", "Netflix"],
            hint: "Proxy and Real object implement the same interface. Proxy initialises real object only on first use.",
            java_sketch: null,
          },
          {
            title: "Rate-Limiting API Proxy",
            difficulty: "Hard",
            what: "Build a RateLimitedAPIProxy that wraps a 3rd-party API client. Track per-user request count in a sliding window. Throw RateLimitExceededException when limit is hit.",
            patterns_used: ["Proxy (Protection)", "Strategy"],
            companies: ["Uber", "Stripe", "Amazon"],
            hint: "The sliding window algorithm is a separate Strategy. Proxy holds the strategy + real client.",
            java_sketch: null,
          },
        ],
      },
      {
        name: "Composite",
        tag: "🌳",
        asked: ["Google", "Amazon", "Microsoft"],
        concept:
          "Treat individual objects and compositions uniformly — the classic tree structure.",
        problems: [
          {
            title: "File System (File & Folder)",
            difficulty: "Medium",
            what: "Design a file system where File and Directory both implement a FileComponent interface. getSize() on a Directory recursively sums all contents.",
            patterns_used: ["Composite"],
            companies: ["Google", "Microsoft"],
            hint: "Leaf (File) has no children. Composite (Directory) delegates to children. Client treats both the same.",
            java_sketch: `interface FileComponent { int getSize(); void print(String indent); }
class File implements FileComponent { ... }
class Directory implements FileComponent {
  List<FileComponent> children = new ArrayList<>();
  public int getSize() {
    return children.stream().mapToInt(FileComponent::getSize).sum();
  }
}`,
          },
        ],
      },
    ],
  },
  {
    id: 3,
    label: "Phase 3",
    duration: "Week 5–7",
    title: "Behavioural Patterns",
    subtitle: "How objects communicate — the interview heavyweights",
    color: "#FF6B47",
    accent: "#1a0800",
    patterns: [
      {
        name: "Strategy",
        tag: "♟️",
        asked: ["Amazon", "Flipkart", "Uber", "Google", "Meesho"],
        concept:
          "Swap algorithms at runtime. Eliminates giant if-else/switch chains.",
        problems: [
          {
            title: "Sorting Strategy",
            difficulty: "Easy",
            what: "Build a Sorter that can use BubbleSort, QuickSort, or MergeSort interchangeably at runtime.",
            patterns_used: ["Strategy"],
            companies: ["Flipkart", "Amazon"],
            hint: "SortStrategy interface with sort(int[]). Sorter holds a strategy reference. setStrategy() at runtime.",
            java_sketch: `interface SortStrategy { void sort(int[] arr); }
class QuickSort implements SortStrategy { ... }
class MergeSort  implements SortStrategy { ... }

class Sorter {
  private SortStrategy strategy;
  public void setStrategy(SortStrategy s) { this.strategy = s; }
  public void sort(int[] arr) { strategy.sort(arr); }
}`,
          },
          {
            title: "Ride Fare Calculator",
            difficulty: "Medium",
            what: "Uber-style fare calculation with NormalFare, SurgeFare, PeakHourFare, PoolFare strategies. Switch strategies dynamically based on demand.",
            patterns_used: ["Strategy"],
            companies: ["Uber", "Ola"],
            hint: "FareStrategy interface. RideService holds it. Before each ride, pick the right strategy based on demand signal.",
            java_sketch: null,
          },
          {
            title: "Issue Assignment Strategy (Jira-like)",
            difficulty: "Hard",
            what: "Ticket system assigns issues via RoundRobin, LeastLoaded, or SkillBased strategy. Swappable at runtime per team.",
            patterns_used: ["Strategy", "Observer"],
            companies: ["Atlassian", "Flipkart"],
            hint: "AssignmentStrategy interface. Teams hold a strategy reference. Observer keeps strategy's load counts updated.",
            java_sketch: null,
          },
        ],
      },
      {
        name: "Observer",
        tag: "👁️",
        asked: ["Amazon", "Google", "Flipkart", "Netflix", "Uber"],
        concept:
          "Publish/Subscribe. Subject notifies all observers when state changes.",
        problems: [
          {
            title: "Stock Price Alert System",
            difficulty: "Easy",
            what: "StockMarket is the Subject. Multiple observers: MobileApp, EmailAlert, DashboardWidget. When price changes, all observers are notified.",
            patterns_used: ["Observer"],
            companies: ["Bloomberg", "Zerodha"],
            hint: "Subject holds a List<Observer>. subscribe/unsubscribe methods. notifyObservers() loops through all.",
            java_sketch: `interface Observer { void update(String stock, double price); }
interface Subject {
  void subscribe(Observer o);
  void unsubscribe(Observer o);
  void notifyAll();
}
class StockMarket implements Subject {
  private Map<String, Double> prices = new HashMap<>();
  private List<Observer> observers = new ArrayList<>();
  public void setPrice(String stock, double price) {
    prices.put(stock, price);
    notifyAll();
  }
}`,
          },
          {
            title: "Netflix / Hotstar New Show Notifier",
            difficulty: "Medium",
            what: "When a new show is added to a category, all subscribed users get notified. Users can subscribe to multiple categories.",
            patterns_used: ["Observer"],
            companies: ["Netflix", "Hotstar"],
            hint: "Map<Category, List<Observer>> for per-category subscriptions. Topic-based observer.",
            java_sketch: null,
          },
          {
            title: "Event Bus / Message Queue",
            difficulty: "Hard",
            what: "Build a lightweight in-memory EventBus. Components publish events by type. Subscribers register handlers per event type.",
            patterns_used: ["Observer", "Command"],
            companies: ["Uber", "Lyft", "LinkedIn"],
            hint: "Map<String, List<EventHandler>>. publish() finds all handlers for that event type and calls them.",
            java_sketch: `class EventBus {
  private Map<String, List<Consumer<Event>>> handlers = new HashMap<>();
  
  public void subscribe(String eventType, Consumer<Event> handler) {
    handlers.computeIfAbsent(eventType, k -> new ArrayList<>()).add(handler);
  }
  public void publish(Event event) {
    handlers.getOrDefault(event.type(), List.of())
            .forEach(h -> h.accept(event));
  }
}`,
          },
        ],
      },
      {
        name: "Command",
        tag: "📋",
        asked: ["Amazon", "Microsoft", "Google"],
        concept:
          "Encapsulate requests as objects. Enables undo/redo, queuing, logging.",
        problems: [
          {
            title: "Text Editor with Undo/Redo",
            difficulty: "Medium",
            what: "Build a text editor with TypeCommand, DeleteCommand, BoldCommand. Each knows how to execute() and undo(). Maintain command history stack.",
            patterns_used: ["Command"],
            companies: ["Microsoft", "Adobe", "Google Docs"],
            hint: "Two stacks: undoStack and redoStack. undo() pops undoStack, calls undo(), pushes to redoStack.",
            java_sketch: `interface Command { void execute(); void undo(); }
class TypeCommand implements Command {
  Editor editor; String text;
  public void execute() { editor.insertText(text); }
  public void undo()    { editor.deleteText(text.length()); }
}
class CommandHistory {
  Deque<Command> undoStack = new ArrayDeque<>();
  public void executeCommand(Command c) {
    c.execute(); undoStack.push(c);
  }
  public void undo() { if (!undoStack.isEmpty()) undoStack.pop().undo(); }
}`,
          },
          {
            title: "Smart Home Automation",
            difficulty: "Medium",
            what: "Remote control with configurable buttons mapping to commands (LightsOn, TVOn, ACSetTemp). Support undo.",
            patterns_used: ["Command"],
            companies: ["Amazon (Alexa)", "Apple (HomeKit)"],
            hint: "Remote holds a Command[] slots array. setCommand(slot, cmd). pressButton(slot) calls execute().",
            java_sketch: null,
          },
        ],
      },
      {
        name: "Chain of Responsibility",
        tag: "⛓️",
        asked: ["Amazon", "Flipkart", "Uber", "Google"],
        concept:
          "Pass request along a chain of handlers. Each decides to process or pass forward.",
        problems: [
          {
            title: "Logger with Log Levels",
            difficulty: "Easy",
            what: "Logging chain: ConsoleLogger (DEBUG), FileLogger (WARN), DatabaseLogger (ERROR). Message at level X handled by the first matching logger.",
            patterns_used: ["Chain of Responsibility"],
            companies: ["Amazon", "Flipkart"],
            hint: "Each logger has a next reference and a level. If level matches, handle. Otherwise call next.handle().",
            java_sketch: `abstract class Logger {
  protected Logger next;
  protected int level;
  public void setNext(Logger next) { this.next = next; }
  public void log(int level, String msg) {
    if (this.level <= level) write(msg);
    if (next != null) next.log(level, msg);
  }
  protected abstract void write(String msg);
}`,
          },
          {
            title: "ATM Cash Dispenser",
            difficulty: "Medium",
            what: "ATM denomination handlers: Rs2000, Rs500, Rs100, Rs50. Withdrawal passes through chain. Each dispenses what it can and passes remainder.",
            patterns_used: ["Chain of Responsibility"],
            companies: ["Classic interview problem"],
            hint: "Each handler divides amount by denomination, dispenses that many notes, passes remainder to next.",
            java_sketch: null,
          },
          {
            title: "HTTP Request Middleware Pipeline",
            difficulty: "Hard",
            what: "Express.js-style middleware: AuthMiddleware → RateLimitMiddleware → LoggingMiddleware → RouteHandler. Each calls next() or throws to abort.",
            patterns_used: ["Chain of Responsibility"],
            companies: ["Uber", "Stripe"],
            hint: "Middleware interface with handle(request, next). Chain assembled dynamically. Short-circuit by not calling next().",
            java_sketch: null,
          },
        ],
      },
      {
        name: "State",
        tag: "🔄",
        asked: ["Amazon", "Flipkart", "Uber", "Swiggy", "Google"],
        concept:
          "Object behaves differently based on internal state. State transitions are first-class.",
        problems: [
          {
            title: "Vending Machine",
            difficulty: "Medium",
            what: "States: Idle → HasMoney → Dispensing → OutOfStock. Actions: insertCoin(), selectProduct(), dispense(), refund(). Invalid actions rejected cleanly.",
            patterns_used: ["State"],
            companies: ["Amazon", "Google"],
            hint: "VendingMachine holds a State reference. Each state implements the same interface. Transitions happen inside state methods.",
            java_sketch: `interface VendingState {
  void insertCoin(VendingMachine vm);
  void selectProduct(VendingMachine vm, String product);
  void dispense(VendingMachine vm);
}
class IdleState implements VendingState {
  public void insertCoin(VendingMachine vm) {
    System.out.println("Coin accepted");
    vm.setState(new HasMoneyState());
  }
  public void dispense(VendingMachine vm) {
    System.out.println("Insert coin first!");
  }
}`,
          },
          {
            title: "Order State Machine",
            difficulty: "Medium",
            what: "E-commerce order: Placed → Confirmed → Shipped → Delivered | Cancelled | Returned. Each state allows certain transitions only.",
            patterns_used: ["State"],
            companies: ["Amazon", "Flipkart", "Swiggy"],
            hint: "Order holds current OrderState. Each state class knows which transitions are valid from it.",
            java_sketch: null,
          },
          {
            title: "Traffic Light System",
            difficulty: "Easy",
            what: "Traffic light: Red → Green → Yellow → Red. Each state knows its duration and next state. Build a timer-driven state machine.",
            patterns_used: ["State"],
            companies: ["Classic interview problem"],
            hint: "Simplest state pattern example. Good warm-up before vending machine.",
            java_sketch: null,
          },
        ],
      },
      {
        name: "Template Method",
        tag: "📄",
        asked: ["Google", "Amazon", "Microsoft"],
        concept:
          "Define the skeleton of an algorithm; let subclasses fill in specific steps.",
        problems: [
          {
            title: "Data Export Pipeline",
            difficulty: "Medium",
            what: "Export pipeline: readData() → processData() → formatData() → writeOutput(). Base class defines order. Subclasses: CSVExporter, JSONExporter, XMLExporter override specific steps.",
            patterns_used: ["Template Method"],
            companies: ["Google", "Microsoft"],
            hint: "AbstractExporter has final export(). Steps are abstract. Subclasses override only what differs.",
            java_sketch: `abstract class DataExporter {
  public final void export(String source) {
    List<Row> data  = readData(source);
    List<Row> clean = processData(data);
    String output   = formatData(clean);
    writeOutput(output);
  }
  protected abstract List<Row> readData(String source);
  protected abstract String formatData(List<Row> data);
  protected void writeOutput(String output) { System.out.println(output); }
  private List<Row> processData(List<Row> data) { return data; }
}`,
          },
        ],
      },
    ],
  },
  {
    id: 4,
    label: "Phase 4",
    duration: "Week 8–9",
    title: "Machine Coding Rounds",
    subtitle: "Full LLD problems — 60 to 90 min timed practice",
    color: "#B447FF",
    accent: "#0a0010",
    patterns: [
      {
        name: "Parking Lot",
        tag: "🚗",
        asked: ["Amazon", "Flipkart", "Google", "Microsoft", "Uber"],
        concept:
          "Classic LLD. Tests: inheritance, OCP, Singleton, Strategy, State",
        problems: [
          {
            title: "Design a Parking Lot System",
            difficulty: "Hard",
            what: "Support multiple vehicle types (Bike, Car, Truck) and spot types (Compact, Large, Handicapped). Assign nearest spot, calculate fees, handle entry/exit.",
            patterns_used: [
              "Singleton (ParkingLot)",
              "Strategy (FeeCalculation)",
              "Factory (Ticket)",
              "State (Spot status)",
            ],
            companies: ["Amazon", "Google", "Flipkart", "Microsoft"],
            hint: "Key classes: ParkingLot, ParkingFloor, ParkingSpot, Vehicle, Ticket, FeeStrategy. Start with working code.",
            java_sketch: null,
          },
        ],
      },
      {
        name: "Snake & Ladder",
        tag: "🐍",
        asked: ["Flipkart", "Uber", "Swiggy", "Meesho"],
        concept:
          "Tests: OOP modeling, clean separation of entities, no god class",
        problems: [
          {
            title: "Design Snake & Ladder Game",
            difficulty: "Hard",
            what: "N players take turns rolling dice. Board has snakes and ladders. Game ends when a player reaches 100. Support multiple game sessions.",
            patterns_used: [
              "Factory (snakes/ladders)",
              "Observer (game events)",
              "State (player turn)",
            ],
            companies: ["Flipkart", "Uber", "Swiggy"],
            hint: "Key classes: Game, Board, Player, Dice, Snake, Ladder, Cell. Dice can be mocked for testing.",
            java_sketch: null,
          },
        ],
      },
      {
        name: "Library Management",
        tag: "📚",
        asked: ["Amazon", "Microsoft", "Flipkart"],
        concept: "Tests: search, reservations, SOLID, clean modeling",
        problems: [
          {
            title: "Design a Library Management System",
            difficulty: "Hard",
            what: "Members search books, borrow (with due date), return (with fine), reserve waiting books. Admin can add/remove books.",
            patterns_used: [
              "Observer (reserved book available)",
              "Strategy (fine calculation)",
              "Singleton (Library)",
            ],
            companies: ["Amazon", "Microsoft"],
            hint: "Key classes: Library, Book, BookItem, Member, Loan, Reservation, FineCalculator. BookItem is a physical copy; Book is the title.",
            java_sketch: null,
          },
        ],
      },
      {
        name: "Elevator System",
        tag: "🛗",
        asked: ["Google", "Amazon", "Uber"],
        concept:
          "State machine + scheduling algorithm — tests algorithmic thinking inside OOP",
        problems: [
          {
            title: "Design an Elevator System",
            difficulty: "Hard",
            what: "N elevators. Dispatch picks nearest idle or same-direction elevator. Each elevator is a state machine: Idle, Moving Up, Moving Down, Maintenance.",
            patterns_used: [
              "State (elevator state)",
              "Strategy (dispatch algorithm)",
              "Observer (floor button events)",
            ],
            companies: ["Google", "Uber", "Amazon"],
            hint: "ElevatorController is the brain. Each Elevator has a State. Start with a simple SCAN algorithm.",
            java_sketch: null,
          },
        ],
      },
    ],
  },
];



