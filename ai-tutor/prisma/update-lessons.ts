/**
 * Updates existing lesson content with detailed line-by-line explanations.
 * Run with: npx tsx prisma/update-lessons.ts
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const UPDATED_LESSONS: Record<string, string> = {

// ─────────────────────────────────────────────────────────────────
"cpp-classes-intro": `# Your First C++ Class

In SystemC, **every hardware module is a C++ class**. The \`SC_MODULE\` macro you'll use constantly
is just a fancy way of writing a class. Before we get there, you need to understand exactly
how classes work — because bugs in modules are almost always C++ class bugs in disguise.

---

## What Is a Class?

A class is a **blueprint** for creating objects. Think of it like a chip datasheet:
- It defines what **data** the chip stores internally (data members = registers, configuration)
- It defines what **operations** the chip can perform (member functions = behaviors)

\`\`\`cpp
class Counter {          // "Counter" is the class name — the blueprint
private:                 // Only code inside this class can access these
    int count;           // Internal state (like a hardware register)
    int max_value;       // Configuration register — set once at startup

public:                  // Anyone can call these — like pins on a chip
    Counter(int max_val) // Constructor: runs when object is created (power-on reset)
        : count(0),      // Initialize count to 0
          max_value(max_val) // Store the max value passed in
    {}                   // Empty constructor body — initialization done above

    void increment() {   // Behavior: advance the counter by 1
        if (count < max_value) {
            count++;     // Only increment if we haven't hit the max
        }
    }

    void reset() {       // Behavior: set counter back to zero
        count = 0;
    }

    int get_count() const {  // "const" = this function doesn't modify the object
        return count;        // Return the current value
    }
};                       // <-- Semicolon after the closing brace — easy to forget!
\`\`\`

---

## Access Specifiers: private vs public

This is the most important concept in classes. It directly maps to hardware:

\`\`\`cpp
class MyChip {
private:
    // Think of private as "internal logic" — the wires and registers
    // inside the chip that users of the chip never see or touch.
    int internal_state;
    void internal_helper() { /* ... */ }

public:
    // Think of public as "pins" — the interface the outside world uses.
    // If you're designing an IC, only expose what's absolutely needed.
    void write(int value);
    int read() const;
};
\`\`\`

**Rule of thumb**: Make everything \`private\` by default. Only make something \`public\` when
external code genuinely needs it. This is called **encapsulation** — and SystemC enforces it
strictly (ports are public, internal signals are private).

---

## Constructors: The Power-On Reset

The constructor runs **once** when the object is created. In hardware terms: power-on reset.

\`\`\`cpp
Counter c1(100);    // Constructor runs here: count=0, max_value=100
Counter c2(255);    // Second object: its own count=0, max_value=255
                    // c1 and c2 are completely independent objects!
\`\`\`

### The Initializer List (use this!)

\`\`\`cpp
// BAD — assignment inside body (works but less efficient):
Counter(int max_val) {
    count = 0;         // This is assignment AFTER the member is default-constructed
    max_value = max_val;
}

// GOOD — initializer list (construct directly with the right value):
Counter(int max_val)
    : count(0),        // The colon starts the initializer list
      max_value(max_val)
{
    // Body runs after all members are initialized
}
\`\`\`

In SystemC, you **must** use initializer lists for ports and submodules — the library
requires it. Build the habit now.

---

## The \`this\` Pointer

Inside any member function, \`this\` is a pointer to the current object. You need it when
a parameter has the same name as a member:

\`\`\`cpp
class Register {
    int value;         // Member called "value"

public:
    void set(int value) {      // Parameter also called "value" — conflict!
        this->value = value;   // "this->value" = the member, "value" = the parameter
    }
};
\`\`\`

In SystemC, \`this\` appears constantly when you write:
\`\`\`cpp
SC_CTOR(MyModule) {
    SC_METHOD(process);          // Registers "process" on THIS module
    sensitive << this->clk;     // Sensitivity to THIS module's clk port
}
\`\`\`

---

## Destructors: Cleanup

The destructor runs when an object is destroyed. In hardware simulation,
SystemC modules are destroyed at the end of the simulation.

\`\`\`cpp
class Buffer {
    int* data;         // Dynamically allocated memory

public:
    Buffer(int size) {
        data = new int[size];   // Allocate memory in constructor
    }

    ~Buffer() {                 // Destructor: tilde (~) before the class name
        delete[] data;          // Free memory — ALWAYS pair new[] with delete[]
    }
};
\`\`\`

**For SystemC**: You won't often write destructors for simple modules, but understanding
them matters because SystemC's cleanup mechanism relies on them.

---

## Using a Class

\`\`\`cpp
int main() {
    Counter c(10);          // Create object: count=0, max_value=10

    c.increment();          // count is now 1
    c.increment();          // count is now 2
    c.increment();          // count is now 3

    int val = c.get_count();  // val = 3
    std::cout << val;         // Prints: 3

    c.reset();              // count is back to 0
    // c.count = 5;         // ERROR! count is private — won't compile

    return 0;
}   // <-- c is destroyed here, destructor runs automatically
\`\`\`

---

## How This Maps to SystemC

When you write your first SystemC module, you'll recognize all of this:

\`\`\`cpp
SC_MODULE(Adder) {          // Expands to: struct Adder : public sc_module {
    sc_in<int>  a, b;       // PUBLIC ports — these are the "pins"
    sc_out<int> result;     // PUBLIC output port

    SC_CTOR(Adder) {        // Expands to: Adder(sc_module_name name) — the constructor
        SC_METHOD(compute); // Register "compute" as a process on THIS module
        sensitive << a << b; // Sensitivity list — like an always @(a, b) in Verilog
    }

    void compute() {        // PRIVATE behavior — called by the simulation kernel
        result.write(a.read() + b.read());
    }
};
\`\`\`

Every single concept from this lesson — class, constructor, public/private, member functions —
is right there in that 10-line module.

---

## Key Takeaways

- A class bundles **data** (members) and **behavior** (functions) together
- \`private\` = internal wires/registers, \`public\` = pins/interface
- The **constructor** initializes the object — use initializer lists
- \`this\` pointer refers to the current object
- Every SystemC module IS a C++ class — master this before moving on`,

// ─────────────────────────────────────────────────────────────────
"cpp-classes-advanced": `# Classes in Depth: Composition and Design

You know how to define a single class. Now let's build **systems** out of classes — because
in hardware, nothing works in isolation. A CPU contains an ALU, register file, and control unit.
In SystemC, complex modules contain sub-modules. It's all the same pattern: **composition**.

---

## Composition: Objects Inside Objects

Composition means one class **has** another class as a member. This is how you model
hardware hierarchy — exactly like a block diagram.

\`\`\`cpp
// Step 1: Define the small building blocks

class ALU {
public:
    int add(int a, int b) { return a + b; }  // Addition operation
    int sub(int a, int b) { return a - b; }  // Subtraction operation
    int AND(int a, int b) { return a & b; }  // Bitwise AND
};
// ALU has no state — it's purely combinational logic. No constructor needed.

class RegisterFile {
    int regs[32] = {};  // 32 registers, all initialized to 0 by = {}
    //                     This is aggregate initialization — applies to arrays

public:
    int read(int index) const {   // const: reading doesn't change the register file
        return regs[index];       // Return value of register at given index
    }

    void write(int index, int value) {  // Non-const: writing changes state
        regs[index] = value;            // Store value into specified register
    }
};

// Step 2: Compose them into a CPU
class SimpleCPU {
    ALU alu;               // CPU HAS-AN ALU (composition)
    RegisterFile reg_file; // CPU HAS-A RegisterFile (composition)
    int pc;                // Program counter — tracks which instruction runs next

public:
    SimpleCPU() : pc(0) {}  // Initialize pc to 0 at power-on

    // Execute: rd = rs1 + rs2
    void execute_add(int rd, int rs1, int rs2) {
        int a = reg_file.read(rs1);   // Read first operand from register file
        int b = reg_file.read(rs2);   // Read second operand
        int result = alu.add(a, b);   // Compute using ALU
        reg_file.write(rd, result);   // Write result back to register file
        pc++;                          // Advance program counter
    }
};
\`\`\`

**Why this matters for SystemC**: SystemC modules contain sub-modules using the same
composition pattern. A top-level module instantiates sub-modules as member objects.

---

## Inheritance vs Composition

You'll see both in SystemC. Know the difference:

\`\`\`cpp
// Composition: "HAS-A" relationship
class CPU {
    ALU alu;          // CPU has an ALU
    Cache cache;      // CPU has a Cache
};

// Inheritance: "IS-A" relationship
class FastALU : public ALU {    // FastALU IS-AN ALU (extends it)
    // Adds pipelining on top of basic ALU
};
\`\`\`

In SystemC:
- **Every module IS-A sc_module** (inheritance from sc_module)
- **Modules contain sub-modules** (composition — member objects)

---

## Static Members: Shared Across All Instances

A static member belongs to the **class itself**, not to any individual object.
Think of it as a global variable that's scoped to the class.

\`\`\`cpp
class Module {
    static int instance_count;  // One copy, shared by ALL Module objects
    int id;                      // Each object has its OWN id

public:
    Module()
        : id(instance_count++)   // Assign current count as this object's id, then increment
    {}

    static int get_count() {     // static function: can call without an object
        return instance_count;   // Can only access static members
    }

    int get_id() const {
        return id;               // Each object returns its own unique id
    }
};

// MUST define static members outside the class:
int Module::instance_count = 0;  // Initialize to 0

// Usage:
Module m1;  // id=0, instance_count becomes 1
Module m2;  // id=1, instance_count becomes 2
Module m3;  // id=2, instance_count becomes 3

cout << Module::get_count();  // 3 — called on the class, not an object
cout << m1.get_id();          // 0
cout << m2.get_id();          // 1
\`\`\`

**In SystemC**: Every module gets a unique name passed to its constructor. The kernel
uses static-like counters internally to track all instantiated modules.

---

## Const Correctness: Be Explicit About Side Effects

Mark a member function \`const\` when it **doesn't modify the object's state**.
This is enforced by the compiler — accidentally modifying state in a \`const\` function
causes a compile error.

\`\`\`cpp
class Signal {
    int value;
    bool changed;

public:
    // CONST function: just reads, no modification allowed
    int read() const {
        return value;
        // changed = true;  // ERROR! Can't modify in a const function
    }

    // NON-CONST function: modifies state
    void write(int new_val) {
        value = new_val;   // OK — this function is not const
        changed = true;
    }

    // CONST function: reading metadata is fine
    bool has_changed() const {
        return changed;
    }
};
\`\`\`

**In SystemC**: \`sc_signal<T>::read()\` is \`const\`, \`sc_signal<T>::write()\` is not.
If you try to write to a signal in an \`SC_METHOD\` that takes a \`const\` signal reference,
the compiler will catch it. This is a feature — it prevents unintended hardware behavior.

---

## Operator Overloading Preview

You can define what operators like \`+\`, \`==\`, \`<<\` do for your class.
SystemC data types (sc_int, sc_uint, sc_logic) use this extensively:

\`\`\`cpp
class Voltage {
    double millivolts;

public:
    Voltage(double mv) : millivolts(mv) {}

    // Overload + so you can write: v1 + v2
    Voltage operator+(const Voltage& other) const {
        return Voltage(millivolts + other.millivolts);
    }

    // Overload == for comparison
    bool operator==(const Voltage& other) const {
        return millivolts == other.millivolts;
    }

    // Overload << for printing
    friend std::ostream& operator<<(std::ostream& os, const Voltage& v) {
        os << v.millivolts << "mV";
        return os;
    }
};

// Now you can write natural-looking code:
Voltage vdd(3300);       // 3.3V
Voltage vss(0);
Voltage rail = vdd + vss;  // Uses your operator+

if (rail == vdd) { /* ... */ }  // Uses your operator==
cout << vdd;                     // Prints: 3300mV — uses your operator<<
\`\`\`

This is exactly how \`sc_logic\` and \`sc_bv\` work in SystemC. When you write
\`sig.read() == sc_logic_1\`, you're using an overloaded \`==\` operator.

---

## Putting It Together: A Memory Model

Here's a mini-example that uses everything — composition, const, static, and clean design:

\`\`\`cpp
class MemoryBlock {
    static int block_count;          // Track how many blocks exist
    int block_id;                     // This block's unique ID
    std::vector<uint8_t> data;        // The actual memory (vector of bytes)
    size_t size;

public:
    // Constructor: allocate memory of given size
    MemoryBlock(size_t bytes)
        : block_id(block_count++),   // Assign unique ID
          data(bytes, 0),            // Initialize all bytes to 0
          size(bytes)
    {}

    // Read a byte — const because reading doesn't change memory
    uint8_t read(size_t addr) const {
        if (addr >= size) return 0xFF;  // Return 0xFF for out-of-bounds (like real HW)
        return data[addr];
    }

    // Write a byte — non-const because it modifies memory
    void write(size_t addr, uint8_t value) {
        if (addr < size) {
            data[addr] = value;
        }
        // Silently ignore out-of-bounds writes (common in HW models)
    }

    // Getters
    size_t get_size() const { return size; }
    int get_id() const { return block_id; }
    static int get_block_count() { return block_count; }
};

int MemoryBlock::block_count = 0;

// Usage:
MemoryBlock rom(1024);    // 1KB ROM — id=0
MemoryBlock ram(65536);   // 64KB RAM — id=1

ram.write(0x100, 0xAB);   // Write byte 0xAB to address 0x100
uint8_t val = ram.read(0x100);  // val = 0xAB

cout << MemoryBlock::get_block_count();  // 2
\`\`\`

---

## Key Takeaways

- **Composition** (HAS-A) is how you build module hierarchies — a module containing sub-modules
- **Static members** are shared across all instances — useful for counters and shared config
- **Const correctness** — mark read-only functions \`const\`, the compiler enforces it
- **Operator overloading** makes user-defined types feel native — SystemC uses this everywhere
- Everything here applies directly to how SystemC modules are structured and composed`,

// ─────────────────────────────────────────────────────────────────
"sc-getting-started": `# Getting Started with SystemC

SystemC is a **C++ class library** that gives C++ the ability to model hardware.
Instead of writing Verilog or VHDL and running a dedicated HDL simulator, you write C++
that simulates like hardware — with time, concurrency, events, and signals.

Think of it this way:
- **Verilog/VHDL**: Hardware description languages compiled by a vendor simulator
- **SystemC**: A C++ library. Your model IS a C++ program that uses the SystemC kernel as its runtime.

---

## The Three Pillars of SystemC

Before writing a single line, understand what SystemC gives you:

### 1. A Simulation Kernel (the time engine)
SystemC manages **simulated time**. When you call \`sc_start()\`, the kernel runs all events
in time order — exactly like a Verilog/VHDL simulator advances the clock.

\`\`\`
Real time: 0s ─────────────────────────────> (simulation runs instantly)
Sim time:  0ns ──> 5ns ──> 10ns ──> 15ns ──> ...
\`\`\`

### 2. Concurrency (parallel processes)
Hardware is inherently parallel — always blocks in Verilog run concurrently.
SystemC gives you **processes** (SC_METHOD, SC_THREAD) that run in parallel,
coordinated by the kernel.

### 3. Communication Primitives (signals, ports, channels)
SystemC provides \`sc_signal\`, \`sc_port\`, \`sc_fifo\` and more to connect modules together —
just like wires and buses connect chips on a PCB.

---

## Your First SystemC Program — Line by Line

\`\`\`cpp
#include <systemc.h>          // Include the entire SystemC library
                               // This gives you SC_MODULE, sc_signal, sc_start, etc.

SC_MODULE(HelloWorld) {        // Defines a module named "HelloWorld"
                               // Expands to: struct HelloWorld : public sc_module {
                               // Every module inherits from sc_module

    SC_CTOR(HelloWorld) {      // The constructor — "SC_CTOR" is a macro
                               // Expands to: HelloWorld(sc_module_name name)
                               // "sc_module_name" is just a typedef for const char*

        SC_THREAD(say_hello);  // Register "say_hello" as a THREAD process
                               // SC_THREAD = can suspend itself with wait()
                               // Runs from start to finish (or loops with wait())
    }

    void say_hello() {         // The process function — must match what you registered
        cout << "Hello from SystemC at time "
             << sc_time_stamp() // Returns current simulation time as sc_time object
             << endl;

        wait(10, SC_NS);       // SUSPEND this process for 10 nanoseconds
                               // The kernel advances time and wakes us up at t=10ns
                               // Nothing else can happen in this process while waiting

        cout << "Now at time " << sc_time_stamp() << endl;
        // After wait() returns, simulation time IS 10ns
    }
};

int sc_main(int argc, char* argv[]) {    // Entry point — REPLACES main()
                                          // SystemC requires sc_main, not main

    HelloWorld hello("hello_inst");       // Instantiate the module
                                          // "hello_inst" = instance name (like in Verilog)
                                          // Passed to sc_module_name in the constructor

    sc_start();    // Start the simulation — run until no more events
                   // The kernel will call say_hello() automatically

    return 0;      // Return 0 = success
}
\`\`\`

**Expected output:**
\`\`\`
Hello from SystemC at time 0 s
Now at time 10 ns
\`\`\`

---

## The sc_main Lifecycle

When your program runs, here's the exact sequence:

\`\`\`
1. sc_main() starts
2. Modules are created (constructors run = Elaboration phase)
   └─ Ports are created
   └─ Processes are registered (SC_THREAD, SC_METHOD)
   └─ Signals are created
3. sc_start() is called
4. Kernel runs Initialization: all processes run once at time 0
5. Kernel enters simulation loop:
   └─ Pick process with earliest wake-up time
   └─ Advance simulation time to that time
   └─ Resume process until it calls wait() or returns
   └─ Process any triggered events (signal changes, etc.)
   └─ Repeat until no more events
6. sc_start() returns
7. sc_main() returns 0
\`\`\`

---

## Time in SystemC

SystemC has a precise time model. Every event happens at a specific simulation time.

\`\`\`cpp
// Time construction — two arguments: value and unit
sc_time t1(10, SC_NS);      // 10 nanoseconds
sc_time t2(1, SC_US);       // 1 microsecond = 1000ns
sc_time t3(100, SC_PS);     // 100 picoseconds
sc_time t4(1, SC_MS);       // 1 millisecond

// Available time units (from smallest to largest):
// SC_FS  = femtoseconds (10^-15)
// SC_PS  = picoseconds  (10^-12)  ← typical for fast digital logic
// SC_NS  = nanoseconds  (10^-9)   ← most common for RTL
// SC_US  = microseconds (10^-6)
// SC_MS  = milliseconds (10^-3)
// SC_SEC = seconds

// Get current time during simulation:
sc_time now = sc_time_stamp();   // Returns current simulation time

// Time arithmetic:
sc_time period(10, SC_NS);
sc_time half_period = period / 2;  // 5ns — yes, sc_time supports arithmetic

// Controlling simulation duration:
sc_start(100, SC_NS);    // Run for exactly 100ns then stop
sc_start();              // Run until no more events (no time limit)
sc_start(0, SC_NS);      // Run one delta cycle (useful for initialization)
\`\`\`

---

## Delta Cycles: The Hidden Time Step

This is one of the trickiest concepts in SystemC (and VHDL/Verilog too).

When a signal changes, the change doesn't take effect **immediately** — it takes effect
after a **delta cycle** (written as Δ). Multiple things can happen at the same simulation
time but different delta cycles.

\`\`\`
Time 10ns:
  Δ0: Signal A changes value
  Δ1: Process sensitive to A wakes up, reads new value, changes signal B
  Δ2: Process sensitive to B wakes up, reads new value of B
  ... continues until no more changes at 10ns
Time 10ns + 1 delta = stable, advance to next event time
\`\`\`

You don't need to manage delta cycles manually — the kernel handles it.
But you need to know they exist to understand why \`sc_time_stamp()\` can show
the same time twice in a row.

---

## SC_MODULE vs SC_THREAD vs SC_METHOD (Preview)

You'll learn these in depth soon. Here's the quick mental model:

| Concept | Hardware Equivalent | When to Use |
|---------|--------------------|----|
| \`SC_MODULE\` | A chip / IP block | Defining any hardware block |
| \`SC_METHOD\` | Combinational logic (always @) | Purely combinational, runs to completion |
| \`SC_THREAD\` | Sequential process | Has delays, can call wait(), models clocked behavior |

---

## Building SystemC (How It Compiles)

SystemC is a library — you compile it and link against it:

\`\`\`bash
# Compile your model and link against SystemC:
g++ -std=c++14 \\
    -I$SYSTEMC_HOME/include \\    # Tell compiler where systemc.h is
    -L$SYSTEMC_HOME/lib \\        # Tell linker where libsystemc.so is
    my_module.cpp \\
    -lsystemc \\                   # Link the SystemC library
    -o my_sim                      # Output executable name

# Run it:
./my_sim
\`\`\`

In professional environments you'd use CMake or a Makefile.
For this tutor's exercises, we evaluate code conceptually — no compilation needed.

---

## Key Takeaways

- SystemC is a **C++ library**, not a separate language — your hardware model is a C++ program
- \`SC_MODULE\` = a C++ class that inherits from \`sc_module\`
- \`sc_main\` replaces \`main()\` — create modules here, then call \`sc_start()\`
- \`SC_THREAD\` = a process that can \`wait()\` for time to pass
- \`SC_METHOD\` = a process that runs to completion (no wait — covered in Processes lesson)
- Time units: \`SC_FS, SC_PS, SC_NS, SC_US, SC_MS, SC_SEC\`
- The kernel manages all timing — you just write processes and use \`wait()\``,

};

async function main() {
  console.log("Updating lesson content...\n");

  for (const [slug, newContent] of Object.entries(UPDATED_LESSONS)) {
    const lesson = await prisma.lesson.findUnique({ where: { slug } });
    if (!lesson) {
      console.log(`  ⚠ Lesson not found: ${slug}`);
      continue;
    }
    await prisma.lesson.update({
      where: { slug },
      data: { content: newContent },
    });
    console.log(`  ✓ Updated: ${lesson.title}`);
  }

  console.log("\nDone!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
