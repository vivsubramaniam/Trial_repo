// Curriculum definitions for seeding the database
// 3 tracks: C++ for SystemC, SystemC, TLM 2.0

export interface TrackDef {
  slug: string;
  title: string;
  description: string;
  orderIndex: number;
  topics: TopicDef[];
}

export interface TopicDef {
  slug: string;
  title: string;
  description: string;
  orderIndex: number;
}

export interface DependencyDef {
  dependent: string; // topic slug
  prerequisite: string; // topic slug
}

export const TRACKS: TrackDef[] = [
  {
    slug: "cpp-for-systemc",
    title: "C++ for SystemC",
    description:
      "Essential C++ concepts you need to master before diving into SystemC. This is not a full C++ course — only the subset directly relevant to hardware modeling.",
    orderIndex: 0,
    topics: [
      {
        slug: "cpp-classes-objects",
        title: "Classes & Objects",
        description:
          "Constructors, destructors, member functions, access specifiers, the `this` pointer. The foundation for SC_MODULE.",
        orderIndex: 0,
      },
      {
        slug: "cpp-inheritance-polymorphism",
        title: "Inheritance & Polymorphism",
        description:
          "Virtual functions, abstract classes, override keyword. Required for SystemC channels and interfaces.",
        orderIndex: 1,
      },
      {
        slug: "cpp-operator-overloading",
        title: "Operator Overloading",
        description:
          "Overloading <<, ==, assignment operators. Used extensively by SystemC data types.",
        orderIndex: 2,
      },
      {
        slug: "cpp-templates",
        title: "Templates",
        description:
          "Function and class templates, template specialization. Used for parameterized SystemC modules and TLM sockets.",
        orderIndex: 3,
      },
      {
        slug: "cpp-pointers-references",
        title: "Pointers, References & Dynamic Memory",
        description:
          "Pointer arithmetic, references, new/delete, smart pointers. Essential for port binding and signal connections.",
        orderIndex: 4,
      },
      {
        slug: "cpp-namespaces-headers",
        title: "Namespaces & Header Organization",
        description:
          "Namespaces, header guards, forward declarations. How to structure SystemC project files.",
        orderIndex: 5,
      },
      {
        slug: "cpp-stl-essentials",
        title: "STL Essentials",
        description:
          "std::vector, std::map, iterators, algorithms. Commonly used in SystemC testbenches and models.",
        orderIndex: 6,
      },
    ],
  },
  {
    slug: "systemc",
    title: "SystemC",
    description:
      "Learn SystemC from the ground up — modules, ports, signals, processes, and simulation. Build hardware models in C++.",
    orderIndex: 1,
    topics: [
      {
        slug: "sc-introduction",
        title: "Introduction to SystemC",
        description:
          "The SystemC simulation kernel, sc_main, time model, installation and setup.",
        orderIndex: 0,
      },
      {
        slug: "sc-modules",
        title: "Modules",
        description:
          "SC_MODULE macro, module hierarchy, constructors (SC_CTOR), module instantiation.",
        orderIndex: 1,
      },
      {
        slug: "sc-ports-signals",
        title: "Ports & Signals",
        description:
          "sc_in, sc_out, sc_inout, sc_signal, port binding rules, sensitivity.",
        orderIndex: 2,
      },
      {
        slug: "sc-processes",
        title: "Processes",
        description:
          "SC_METHOD, SC_THREAD, SC_CTHREAD, sensitivity lists, wait() statements, event-driven simulation.",
        orderIndex: 3,
      },
      {
        slug: "sc-data-types",
        title: "Data Types",
        description:
          "sc_int, sc_uint, sc_bv, sc_lv, sc_logic, sc_fixed. When and why to use each.",
        orderIndex: 4,
      },
      {
        slug: "sc-channels-interfaces",
        title: "Channels & Interfaces",
        description:
          "sc_fifo, custom channels, sc_interface, communication protocols between modules.",
        orderIndex: 5,
      },
      {
        slug: "sc-simulation-control",
        title: "Simulation Control",
        description:
          "sc_start, sc_stop, sc_time, tracing with sc_trace, VCD waveform generation.",
        orderIndex: 6,
      },
      {
        slug: "sc-testbenches",
        title: "Testbench Design",
        description:
          "Writing testbenches, stimulus generation, monitors, checkers, assertions, coverage.",
        orderIndex: 7,
      },
      {
        slug: "sc-advanced",
        title: "Advanced SystemC",
        description:
          "Hierarchical channels, dynamic processes, elaboration vs simulation phases.",
        orderIndex: 8,
      },
    ],
  },
  {
    slug: "tlm2",
    title: "TLM 2.0",
    description:
      "Transaction Level Modeling — the standard for building virtual platforms and high-level SoC models. Your priority track.",
    orderIndex: 2,
    topics: [
      {
        slug: "tlm-concepts",
        title: "TLM Concepts",
        description:
          "Abstraction levels (untimed, loosely-timed, approximately-timed), coding styles, interoperability layer.",
        orderIndex: 0,
      },
      {
        slug: "tlm-generic-payload",
        title: "Generic Payload",
        description:
          "tlm_generic_payload structure, command types, address, data pointer, byte enables, response status, extensions.",
        orderIndex: 1,
      },
      {
        slug: "tlm-sockets",
        title: "Sockets",
        description:
          "tlm_initiator_socket, tlm_target_socket, binding rules, multi-sockets, convenience sockets.",
        orderIndex: 2,
      },
      {
        slug: "tlm-blocking-transport",
        title: "Blocking Transport",
        description:
          "b_transport interface, timing annotation, loosely-timed modeling, temporal decoupling.",
        orderIndex: 3,
      },
      {
        slug: "tlm-nonblocking-transport",
        title: "Non-Blocking Transport",
        description:
          "nb_transport_fw and nb_transport_bw, TLM phases (BEGIN_REQ, END_REQ, BEGIN_RESP, END_RESP), state machines.",
        orderIndex: 4,
      },
      {
        slug: "tlm-dmi-debug",
        title: "DMI & Debug Transport",
        description:
          "Direct Memory Interface (get_direct_mem_ptr), debug transport (transport_dbg), performance optimization.",
        orderIndex: 5,
      },
      {
        slug: "tlm-interconnects",
        title: "Building Interconnects",
        description:
          "Routers, arbiters, bus models, address decoding, multi-initiator/multi-target topologies.",
        orderIndex: 6,
      },
      {
        slug: "tlm-virtual-platforms",
        title: "Virtual Platforms",
        description:
          "Assembling complete SoC models: CPU models, memory controllers, peripherals (UART, timer, GPIO), memory maps.",
        orderIndex: 7,
      },
    ],
  },
];

// Cross-track dependencies: dependent topic requires prerequisite topic
export const DEPENDENCIES: DependencyDef[] = [
  // C++ -> SystemC dependencies
  { dependent: "sc-modules", prerequisite: "cpp-classes-objects" },
  { dependent: "sc-channels-interfaces", prerequisite: "cpp-inheritance-polymorphism" },
  { dependent: "sc-data-types", prerequisite: "cpp-operator-overloading" },
  { dependent: "sc-ports-signals", prerequisite: "cpp-pointers-references" },
  { dependent: "sc-introduction", prerequisite: "cpp-namespaces-headers" },
  { dependent: "sc-testbenches", prerequisite: "cpp-stl-essentials" },

  // Within SystemC: sequential dependencies
  { dependent: "sc-modules", prerequisite: "sc-introduction" },
  { dependent: "sc-ports-signals", prerequisite: "sc-modules" },
  { dependent: "sc-processes", prerequisite: "sc-ports-signals" },
  { dependent: "sc-channels-interfaces", prerequisite: "sc-processes" },
  { dependent: "sc-simulation-control", prerequisite: "sc-processes" },
  { dependent: "sc-testbenches", prerequisite: "sc-simulation-control" },
  { dependent: "sc-advanced", prerequisite: "sc-channels-interfaces" },
  { dependent: "sc-advanced", prerequisite: "sc-testbenches" },

  // SystemC -> TLM dependencies
  { dependent: "tlm-concepts", prerequisite: "sc-modules" },
  { dependent: "tlm-concepts", prerequisite: "sc-ports-signals" },
  { dependent: "tlm-sockets", prerequisite: "tlm-concepts" },
  { dependent: "tlm-sockets", prerequisite: "cpp-templates" },
  { dependent: "tlm-generic-payload", prerequisite: "tlm-concepts" },
  { dependent: "tlm-blocking-transport", prerequisite: "tlm-sockets" },
  { dependent: "tlm-blocking-transport", prerequisite: "tlm-generic-payload" },
  { dependent: "tlm-blocking-transport", prerequisite: "sc-processes" },
  { dependent: "tlm-nonblocking-transport", prerequisite: "tlm-blocking-transport" },
  { dependent: "tlm-dmi-debug", prerequisite: "tlm-blocking-transport" },
  { dependent: "tlm-interconnects", prerequisite: "tlm-nonblocking-transport" },
  { dependent: "tlm-interconnects", prerequisite: "tlm-dmi-debug" },
  { dependent: "tlm-virtual-platforms", prerequisite: "tlm-interconnects" },
  { dependent: "tlm-virtual-platforms", prerequisite: "sc-testbenches" },
];

// Sub-skills tracked for the radar chart
export const SKILL_DEFINITIONS = [
  { name: "OOP Fundamentals", topicSlug: "cpp-classes-objects" },
  { name: "Inheritance & Polymorphism", topicSlug: "cpp-inheritance-polymorphism" },
  { name: "Templates", topicSlug: "cpp-templates" },
  { name: "Memory Management", topicSlug: "cpp-pointers-references" },
  { name: "SystemC Modules", topicSlug: "sc-modules" },
  { name: "Ports & Signals", topicSlug: "sc-ports-signals" },
  { name: "Processes", topicSlug: "sc-processes" },
  { name: "Channels & Interfaces", topicSlug: "sc-channels-interfaces" },
  { name: "TLM Sockets", topicSlug: "tlm-sockets" },
  { name: "Blocking Transport", topicSlug: "tlm-blocking-transport" },
  { name: "Non-Blocking Transport", topicSlug: "tlm-nonblocking-transport" },
  { name: "Virtual Platforms", topicSlug: "tlm-virtual-platforms" },
];
