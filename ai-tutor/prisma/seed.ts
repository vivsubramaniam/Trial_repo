import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { TRACKS, DEPENDENCIES, SKILL_DEFINITIONS } from "../src/lib/curriculum";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ─── Initial Lesson Content ───────────────────────────────────────

const INITIAL_LESSONS: Record<string, Array<{
  slug: string;
  title: string;
  content: string;
  difficulty: number;
  orderIndex: number;
  exercises: Array<{
    title: string;
    description: string;
    exerciseType: string;
    starterCode: string;
    solutionCode: string;
    difficulty: number;
    hints: string[];
  }>;
}>> = {
  "cpp-classes-objects": [
    {
      slug: "cpp-classes-intro",
      title: "Your First C++ Class",
      content: `# Your First C++ Class

In SystemC, every hardware module is a C++ class. Before we can build hardware models, you need to understand how classes work.

## What is a Class?

A class is a blueprint for creating objects. Think of it like a **datasheet for a chip** — it defines what pins (data members) and behaviors (member functions) the chip has.

\`\`\`cpp
class Counter {
private:
    int count;      // Internal state (like a register)
    int max_value;  // Configuration

public:
    // Constructor — runs when the object is created (like power-on reset)
    Counter(int max_val) : count(0), max_value(max_val) {}

    // Member functions — the behaviors
    void increment() {
        if (count < max_value) {
            count++;
        }
    }

    void reset() {
        count = 0;
    }

    int get_count() const {
        return count;
    }
};
\`\`\`

## Key Concepts

### Access Specifiers
- \`private\`: Only accessible within the class (internal registers/wires)
- \`public\`: Accessible from outside (the "pins" of your module)
- \`protected\`: Accessible by derived classes (used in inheritance)

### Constructors
The constructor initializes the object. In SystemC, you'll use \`SC_CTOR\` which is a macro that expands to a constructor.

\`\`\`cpp
// C++ constructor with initializer list
Counter(int max_val) : count(0), max_value(max_val) {
    // Body runs after member initialization
}
\`\`\`

### The \`this\` Pointer
Inside a member function, \`this\` points to the current object:

\`\`\`cpp
void set_count(int count) {
    this->count = count;  // Disambiguate member from parameter
}
\`\`\`

### Destructors
Called when an object is destroyed. Important for cleanup:

\`\`\`cpp
class Buffer {
    int* data;
public:
    Buffer(int size) { data = new int[size]; }
    ~Buffer() { delete[] data; }  // Destructor: free memory
};
\`\`\`

## Why This Matters for SystemC

When you write \`SC_MODULE(MyModule)\`, it expands to:

\`\`\`cpp
struct MyModule : public sc_module {
    // Your ports, signals, and processes go here
    SC_CTOR(MyModule) {
        // Register processes here
    }
};
\`\`\`

Everything you learn about classes directly applies to SystemC modules.`,
      difficulty: 1,
      orderIndex: 0,
      exercises: [
        {
          title: "Create a Register Class",
          description: `## Create a Register Class

You're modeling a simple hardware register that stores an integer value.

**Requirements:**
1. Create a class called \`Register\` with:
   - A private \`int value\` member (initialized to 0)
   - A private \`int width\` member (bit width, set via constructor)
   - A public constructor that takes \`width\` as a parameter
   - A public \`write(int val)\` method that stores a value (mask to width bits)
   - A public \`read()\` const method that returns the stored value
   - A public \`reset()\` method that sets value back to 0

**Example usage:**
\`\`\`cpp
Register reg(8);  // 8-bit register
reg.write(255);   // Store 255
reg.read();       // Returns 255
reg.write(256);   // Should store 0 (overflow for 8-bit)
reg.reset();      // Value is now 0
\`\`\``,
          exerciseType: "write",
          starterCode: `#include <iostream>

// Create your Register class here

class Register {
    // TODO: Add private members

public:
    // TODO: Add constructor

    // TODO: Add write method

    // TODO: Add read method

    // TODO: Add reset method
};

// Test code (do not modify)
int main() {
    Register reg(8);
    reg.write(42);
    std::cout << "Value: " << reg.read() << std::endl;  // Should print 42
    reg.write(256);
    std::cout << "Overflow: " << reg.read() << std::endl;  // Should print 0
    reg.reset();
    std::cout << "Reset: " << reg.read() << std::endl;  // Should print 0
    return 0;
}`,
          solutionCode: `#include <iostream>

class Register {
private:
    int value;
    int width;

public:
    Register(int w) : value(0), width(w) {}

    void write(int val) {
        int mask = (1 << width) - 1;
        value = val & mask;
    }

    int read() const {
        return value;
    }

    void reset() {
        value = 0;
    }
};

int main() {
    Register reg(8);
    reg.write(42);
    std::cout << "Value: " << reg.read() << std::endl;
    reg.write(256);
    std::cout << "Overflow: " << reg.read() << std::endl;
    reg.reset();
    std::cout << "Reset: " << reg.read() << std::endl;
    return 0;
}`,
          difficulty: 1,
          hints: [
            "Think about what data a register needs to store: the current value and its bit width.",
            "To mask a value to N bits, use: val & ((1 << N) - 1). For 8 bits, this gives val & 0xFF.",
            "The constructor should use an initializer list: Register(int w) : value(0), width(w) {}"
          ],
        },
        {
          title: "Debug: Fix the ALU Class",
          description: `## Debug: Fix the ALU Class

A colleague wrote a simple ALU (Arithmetic Logic Unit) class but it has several bugs. Find and fix them.

**The ALU should:**
- Store two operands (a and b)
- Support add, subtract, and bitwise AND operations
- Return the result of the selected operation

**There are 3 bugs to find and fix.**`,
          exerciseType: "debug",
          starterCode: `#include <iostream>
#include <string>

class ALU {
private:
    int a, b;
    int result;

public:
    // Bug 1: Constructor doesn't initialize members
    ALU() {}

    void set_operands(int op_a, int op_b) {
        a = op_a;
        b = op_b;
    }

    int execute(std::string operation) {
        if (operation == "add") {
            result = a + b;
        } else if (operation == "sub") {
            result = a + b;  // Bug 2: Wrong operation
        } else if (operation == "and") {
            result = a & b;
        }
        // Bug 3: Missing return statement
    }

    int get_result() const {
        return result;
    }
};

// Test code (do not modify)
int main() {
    ALU alu;
    alu.set_operands(10, 3);

    alu.execute("add");
    std::cout << "10 + 3 = " << alu.get_result() << std::endl;  // Should print 13

    alu.execute("sub");
    std::cout << "10 - 3 = " << alu.get_result() << std::endl;  // Should print 7

    alu.execute("and");
    std::cout << "10 & 3 = " << alu.get_result() << std::endl;  // Should print 2

    return 0;
}`,
          solutionCode: `#include <iostream>
#include <string>

class ALU {
private:
    int a, b;
    int result;

public:
    ALU() : a(0), b(0), result(0) {}

    void set_operands(int op_a, int op_b) {
        a = op_a;
        b = op_b;
    }

    int execute(std::string operation) {
        if (operation == "add") {
            result = a + b;
        } else if (operation == "sub") {
            result = a - b;
        } else if (operation == "and") {
            result = a & b;
        }
        return result;
    }

    int get_result() const {
        return result;
    }
};

int main() {
    ALU alu;
    alu.set_operands(10, 3);

    alu.execute("add");
    std::cout << "10 + 3 = " << alu.get_result() << std::endl;

    alu.execute("sub");
    std::cout << "10 - 3 = " << alu.get_result() << std::endl;

    alu.execute("and");
    std::cout << "10 & 3 = " << alu.get_result() << std::endl;

    return 0;
}`,
          difficulty: 1,
          hints: [
            "Look at the constructor — what happens to a, b, and result if they're not initialized?",
            "Compare the 'sub' case with the 'add' case — the operator should be different.",
            "The execute() function has a return type of int but doesn't return anything."
          ],
        },
      ],
    },
    {
      slug: "cpp-classes-advanced",
      title: "Classes in Depth: Composition and Design",
      content: `# Classes in Depth: Composition and Design

Now that you know the basics, let's explore how classes compose together — just like chips connect on a PCB.

## Composition: Objects Inside Objects

In hardware, a CPU contains an ALU, registers, and a control unit. In C++, we model this with **composition**:

\`\`\`cpp
class ALU {
public:
    int add(int a, int b) { return a + b; }
    int sub(int a, int b) { return a - b; }
};

class RegisterFile {
    int regs[32] = {};  // 32 registers, initialized to 0
public:
    int read(int index) const { return regs[index]; }
    void write(int index, int value) { regs[index] = value; }
};

class SimpleCPU {
    ALU alu;                   // Composition: CPU HAS-AN ALU
    RegisterFile reg_file;     // Composition: CPU HAS-A RegisterFile
    int pc;                    // Program counter

public:
    SimpleCPU() : pc(0) {}

    void execute_add(int rd, int rs1, int rs2) {
        int result = alu.add(reg_file.read(rs1), reg_file.read(rs2));
        reg_file.write(rd, result);
        pc++;
    }
};
\`\`\`

## Static Members

Static members are shared across all instances — like a global configuration register:

\`\`\`cpp
class Module {
    static int instance_count;   // Shared across all modules
    int id;

public:
    Module() : id(instance_count++) {}
    static int get_count() { return instance_count; }
};

int Module::instance_count = 0;  // Must initialize outside class
\`\`\`

## Const Correctness

Mark methods \`const\` when they don't modify the object:

\`\`\`cpp
class Signal {
    int value;
public:
    int read() const { return value; }    // const: doesn't modify
    void write(int v) { value = v; }      // non-const: modifies
};
\`\`\`

This matters in SystemC: \`sc_signal::read()\` is const, \`sc_signal::write()\` is not.

## Copy Semantics

Understanding when objects are copied is crucial for SystemC (signals can't be copied):

\`\`\`cpp
class Register {
    int value;
public:
    Register(int v = 0) : value(v) {}

    // Copy constructor
    Register(const Register& other) : value(other.value) {
        std::cout << "Register copied!" << std::endl;
    }

    // Copy assignment
    Register& operator=(const Register& other) {
        value = other.value;
        return *this;
    }
};
\`\`\`

## Why This Matters for SystemC

- **Composition** is how you build module hierarchies
- **Static members** are used for module naming and counting
- **Const correctness** is enforced by SystemC's port/signal interface
- Understanding **copy semantics** prevents bugs when working with sc_signal (which are non-copyable)`,
      difficulty: 2,
      orderIndex: 1,
      exercises: [
        {
          title: "Build a Simple CPU with Composition",
          description: `## Build a Simple CPU with Composition

Create a simple CPU model using class composition. This mirrors how you'll build SystemC module hierarchies.

**Requirements:**
1. Create an \`ALU\` class with \`add(int, int)\` and \`multiply(int, int)\` methods
2. Create a \`RegisterFile\` class with:
   - An array of 8 integer registers (initialized to 0)
   - \`read(int index)\` and \`write(int index, int value)\` methods
3. Create a \`MiniCPU\` class that:
   - Contains an ALU and RegisterFile (composition)
   - Has an \`execute_add(int rd, int rs1, int rs2)\` method
   - Has an \`execute_mul(int rd, int rs1, int rs2)\` method
   - Has a \`read_reg(int index)\` method`,
          exerciseType: "write",
          starterCode: `#include <iostream>

// Create ALU class
class ALU {
    // TODO
};

// Create RegisterFile class
class RegisterFile {
    // TODO
};

// Create MiniCPU class using composition
class MiniCPU {
    // TODO
};

// Test code (do not modify)
int main() {
    MiniCPU cpu;
    // Write values to registers
    // r1 = 5, r2 = 3
    // This requires adding a load_reg method or directly using reg_file
    // For simplicity, add a load_immediate(int rd, int value) method to MiniCPU

    cpu.load_immediate(1, 5);   // r1 = 5
    cpu.load_immediate(2, 3);   // r2 = 3
    cpu.execute_add(3, 1, 2);   // r3 = r1 + r2 = 8
    cpu.execute_mul(4, 1, 2);   // r4 = r1 * r2 = 15

    std::cout << "r3 = " << cpu.read_reg(3) << std::endl;  // 8
    std::cout << "r4 = " << cpu.read_reg(4) << std::endl;  // 15
    return 0;
}`,
          solutionCode: `#include <iostream>

class ALU {
public:
    int add(int a, int b) { return a + b; }
    int multiply(int a, int b) { return a * b; }
};

class RegisterFile {
    int regs[8] = {};
public:
    int read(int index) const { return regs[index]; }
    void write(int index, int value) { regs[index] = value; }
};

class MiniCPU {
    ALU alu;
    RegisterFile reg_file;

public:
    void load_immediate(int rd, int value) {
        reg_file.write(rd, value);
    }

    void execute_add(int rd, int rs1, int rs2) {
        int result = alu.add(reg_file.read(rs1), reg_file.read(rs2));
        reg_file.write(rd, result);
    }

    void execute_mul(int rd, int rs1, int rs2) {
        int result = alu.multiply(reg_file.read(rs1), reg_file.read(rs2));
        reg_file.write(rd, result);
    }

    int read_reg(int index) const {
        return reg_file.read(index);
    }
};

int main() {
    MiniCPU cpu;
    cpu.load_immediate(1, 5);
    cpu.load_immediate(2, 3);
    cpu.execute_add(3, 1, 2);
    cpu.execute_mul(4, 1, 2);

    std::cout << "r3 = " << cpu.read_reg(3) << std::endl;
    std::cout << "r4 = " << cpu.read_reg(4) << std::endl;
    return 0;
}`,
          difficulty: 2,
          hints: [
            "MiniCPU should have ALU and RegisterFile as private members — this is composition (HAS-A relationship).",
            "execute_add should: read rs1 and rs2 from RegisterFile, pass to ALU.add(), write result to rd in RegisterFile.",
            "Don't forget load_immediate(int rd, int value) — it just calls reg_file.write(rd, value)."
          ],
        },
      ],
    },
  ],
  "sc-introduction": [
    {
      slug: "sc-getting-started",
      title: "Getting Started with SystemC",
      content: `# Getting Started with SystemC

SystemC is a C++ class library that lets you model hardware at various levels of abstraction. Instead of writing Verilog or VHDL, you write C++ that simulates like hardware.

## What is SystemC?

SystemC provides:
- **A simulation kernel** that manages time and events (like a Verilog simulator)
- **Hardware-oriented data types** (4-state logic, fixed-point, bit vectors)
- **Concurrency** via processes that run in parallel (like always blocks in Verilog)
- **Communication** via ports, signals, and channels

## The Simulation Kernel

The SystemC kernel manages:
1. **Elaboration**: Creating and connecting modules (like synthesis netlist generation)
2. **Simulation**: Running processes in response to events (like gate-level simulation)

\`\`\`
Elaboration Phase          Simulation Phase
─────────────────         ──────────────────
Create modules    ──────> Initialize
Bind ports                Run processes
Set up processes          Advance time
                          Repeat until done
\`\`\`

## Your First SystemC Program

\`\`\`cpp
#include <systemc.h>

// A simple module that prints a message
SC_MODULE(HelloWorld) {
    SC_CTOR(HelloWorld) {
        SC_THREAD(say_hello);  // Register a thread process
    }

    void say_hello() {
        cout << "Hello from SystemC at time "
             << sc_time_stamp() << endl;
        wait(10, SC_NS);  // Wait 10 nanoseconds
        cout << "Now at time " << sc_time_stamp() << endl;
    }
};

int sc_main(int argc, char* argv[]) {
    HelloWorld hello("hello");  // Create module instance
    sc_start();                 // Start simulation
    return 0;
}
\`\`\`

## Key Concepts

### sc_main
The entry point for SystemC programs (replaces \`main()\`):
\`\`\`cpp
int sc_main(int argc, char* argv[]) {
    // Create modules, bind ports, start simulation
    sc_start(100, SC_NS);  // Run for 100ns
    return 0;
}
\`\`\`

### Time Model
SystemC has a built-in notion of simulation time:
\`\`\`cpp
sc_time t1(10, SC_NS);     // 10 nanoseconds
sc_time t2(1, SC_US);      // 1 microsecond
sc_time t3 = sc_time_stamp();  // Current simulation time

// Time units: SC_FS, SC_PS, SC_NS, SC_US, SC_MS, SC_SEC
\`\`\`

### SC_MODULE Macro
This macro creates a class derived from \`sc_module\`:
\`\`\`cpp
SC_MODULE(MyModule) {
    // Expands to:
    // struct MyModule : public sc_module {

    SC_CTOR(MyModule) {
        // Expands to a constructor that takes a name parameter
    }
};
\`\`\`

## Setting Up SystemC

To compile SystemC programs, you need:
1. The SystemC library (download from Accellera)
2. A C++ compiler (g++, clang++)
3. Link against \`-lsystemc\`

\`\`\`bash
g++ -I$SYSTEMC_HOME/include -L$SYSTEMC_HOME/lib-linux64 \\
    my_module.cpp -lsystemc -o sim
\`\`\`

In professional environments, you'll typically use a build system (CMake, Make) that handles this.`,
      difficulty: 1,
      orderIndex: 0,
      exercises: [
        {
          title: "Write Your First sc_main",
          description: `## Write Your First sc_main

Create a minimal SystemC program that:
1. Defines a module called \`Timer\` with an SC_THREAD process
2. The process prints "Tick" every 5ns, 3 times total
3. The sc_main creates the Timer and runs the simulation

**Expected output:**
\`\`\`
Tick at 0 s
Tick at 5 ns
Tick at 10 ns
\`\`\``,
          exerciseType: "write",
          starterCode: `#include <systemc.h>

SC_MODULE(Timer) {
    SC_CTOR(Timer) {
        // TODO: Register the tick process
    }

    void tick() {
        // TODO: Print "Tick" 3 times, waiting 5ns between each
    }
};

int sc_main(int argc, char* argv[]) {
    // TODO: Create Timer instance and start simulation
    return 0;
}`,
          solutionCode: `#include <systemc.h>

SC_MODULE(Timer) {
    SC_CTOR(Timer) {
        SC_THREAD(tick);
    }

    void tick() {
        for (int i = 0; i < 3; i++) {
            cout << "Tick at " << sc_time_stamp() << endl;
            wait(5, SC_NS);
        }
    }
};

int sc_main(int argc, char* argv[]) {
    Timer timer("timer");
    sc_start();
    return 0;
}`,
          difficulty: 1,
          hints: [
            "Use SC_THREAD(tick) inside SC_CTOR to register the tick method as a thread process.",
            "In the tick method, use a for loop with wait(5, SC_NS) to pause between ticks.",
            "In sc_main, create the Timer with: Timer timer(\"timer\"); then call sc_start();"
          ],
        },
      ],
    },
  ],
};

// ─── Seed Function ────────────────────────────────────────────────

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.capstoneStep.deleteMany();
  await prisma.capstoneProject.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.sessionState.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.chatSession.deleteMany();
  await prisma.codeQualityScore.deleteMany();
  await prisma.skillRating.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.topicDependency.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.track.deleteMany();

  console.log("Cleared existing data.");

  // Create tracks and topics
  const topicIdMap: Record<string, string> = {};

  for (const trackDef of TRACKS) {
    const track = await prisma.track.create({
      data: {
        slug: trackDef.slug,
        title: trackDef.title,
        description: trackDef.description,
        orderIndex: trackDef.orderIndex,
      },
    });
    console.log(`  Created track: ${track.title}`);

    for (const topicDef of trackDef.topics) {
      const topic = await prisma.topic.create({
        data: {
          slug: topicDef.slug,
          title: topicDef.title,
          description: topicDef.description,
          orderIndex: topicDef.orderIndex,
          trackId: track.id,
        },
      });
      topicIdMap[topicDef.slug] = topic.id;
      console.log(`    Created topic: ${topic.title}`);
    }
  }

  // Create dependencies
  for (const dep of DEPENDENCIES) {
    const dependentId = topicIdMap[dep.dependent];
    const prerequisiteId = topicIdMap[dep.prerequisite];
    if (dependentId && prerequisiteId) {
      await prisma.topicDependency.create({
        data: {
          dependentTopicId: dependentId,
          prerequisiteTopicId: prerequisiteId,
        },
      });
    }
  }
  console.log(`Created ${DEPENDENCIES.length} topic dependencies.`);

  // Create initial lessons and exercises
  for (const [topicSlug, lessons] of Object.entries(INITIAL_LESSONS)) {
    const topicId = topicIdMap[topicSlug];
    if (!topicId) {
      console.warn(`  Warning: Topic ${topicSlug} not found, skipping lessons.`);
      continue;
    }

    for (const lessonDef of lessons) {
      const lesson = await prisma.lesson.create({
        data: {
          slug: lessonDef.slug,
          title: lessonDef.title,
          content: lessonDef.content,
          difficulty: lessonDef.difficulty,
          orderIndex: lessonDef.orderIndex,
          topicId: topicId,
        },
      });
      console.log(`    Created lesson: ${lesson.title}`);

      for (const exDef of lessonDef.exercises) {
        await prisma.exercise.create({
          data: {
            title: exDef.title,
            description: exDef.description,
            exerciseType: exDef.exerciseType,
            starterCode: exDef.starterCode,
            solutionCode: exDef.solutionCode,
            difficulty: exDef.difficulty,
            hints: JSON.stringify(exDef.hints),
            lessonId: lesson.id,
          },
        });
        console.log(`      Created exercise: ${exDef.title}`);
      }
    }
  }

  // Create skill ratings (initialized to 0)
  for (const skill of SKILL_DEFINITIONS) {
    await prisma.skillRating.create({
      data: {
        skillName: skill.name,
        rating: 0,
        topicId: topicIdMap[skill.topicSlug] || null,
      },
    });
  }
  console.log(`Created ${SKILL_DEFINITIONS.length} skill ratings.`);

  console.log("\nSeeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
