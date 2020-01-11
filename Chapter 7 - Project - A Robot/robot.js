/*

Chapter 7 - Project: A Robot (11/1/2020)

Objective: Build an automaton, a little program that performs a task in a
virtual world. Our automaton will be a mail-delivery robot picking up and
dropping off parcels.

*/

// Utility Code

// Create an Array containing the list of roads that exists between
// multiple locations (places) in Meadowfield.
const roads = [
    "Alice's House-Bob's House",   "Alice's House-Cabin",
    "Alice's House-Post Office",   "Bob's House-Town Hall",
    "Daria's House-Ernie's House", "Daria's House-Town Hall",
    "Ernie's House-Grete's House", "Grete's House-Farm",
    "Grete's House-Shop",          "Marketplace-Farm",
    "Marketplace-Post Office",     "Marketplace-Shop",
    "Marketplace-Town Hall",       "Shop-Town Hall"
];


function buildGraph(edges) {
    /* 
     * `graph` is a map-like Object which does not derive properties from
     * any prototype including Object.prototype.
     *  
     * `graph` represents the network of roads in the village. It contains a
     * mapping of places with an array of roads which connect them to other places
     * in the village.
     */

    let graph = Object.create(null);

    function addEdge(from, to) {
        /* 
         * Add a new property with an edge connecting to the destination 
         * if no place exists matching the source location;
         * 
         * Otherwise, add the destination to an existing array containing the roads
         * from the given source location.
         */
 
        if (graph[from] == null) {
            graph[from] = [to];
        } 
        else {
            graph[from].push(to);
        }
    }

    // Loop over an array containing a series of routes (as strings) and add them as
    // edges of the `graph` object.
    // 
    // The arrow function in the `map` function splits the string into
    // a source-destination pair.
    for (let [from, to] of edges.map(r => r.split("-"))) {
        addEdge(from, to);
        addEdge(to, from);
    }

    return graph;
}


// Create a Graph object that can be used to organize & reference the
// network of roads that exist in Meadowfield village.
//
// Since `roadGraph` has been declared constant in the global scope, it is
// a read-only Object that can be referenced by all the classes/functions.
const roadGraph = buildGraph(roads);

function randomPick(array) {
    /*
     * Return a randomly selected element from a given `array`.
     */
    let choice = Math.floor(Math.random() * array.length);
    return array[choice];
}

// End of Utilitarian Code


// VillageState Class

class VillageState {
    /*
    * This class models the current state of the mail-delivery robot.
    * 
    * The class holds information about the current place (location)
    * of the Robot as well as an Array containing instances of Parcels
    * currently being carried by him (i.e., parcels that have been picked up
    * but still needs to be delivered to their proper destination) as well as
    * parcels that still needs to be picked up by the Robot.
    *
    * Hence, the `parcels` represents all the parcels needs to be picked up &
    * delivered by the robot to mark the process of mail-delivery as completed
    * and terminal condition for a simulation.
    * 
    * This will include all the parcels that are either being carried over
    * from the previous state or have just been picked up by the robot to be
    * delivered to their specified address.
    */

    constructor(place, parcels) {
        this.place = place;
        this.parcels = parcels;
    }

    move(destination) {
        /* 
         * Moves the Robot to the destination if a road exists between the current
         * place and the designated destination. Otherwise, returns back the original 
         * instance (containing info about current state).
         * 
         * This function returns a new `VillageState` instance if it's possible for
         * the Robot to directly move to the specified destination.
         * 
         * Therefore, `move` is a pure function because it does not modify the object
         * representing robot's current state. This also allows us to easily keep a track 
         * of the little automaton's movements.
         */

        // If no road exists between the current place and the destination,
        // return back the orginal state (bound to `this`) which called the
        // `move` function.
        if (!roadGraph[this.place].includes(destination)) {
            return this;
        }
        // Otherwise, return a new state of the Robot, after moving to & (possibly)
        // delivering the parcel at its specified destination. 
        // 
        // The new `villageState` instance will have the `destination` as its new `place`
        // and will need to create a new set of Parcels representing the (remaining) parcels
        // that are still in robot's possession after delivering the ones that were 
        // addressed to their `destination`.
        else {
            // Initialize a new set of parcels, using the map function to model
            // the process of moving the parcels (under robot's custody) to the
            // new place.
            // 
            // Once moved (new set of parcels have been created) to the new place
            // (`destination`), use the filter() function to model the process of
            // delivering the parcels at their specified address (which is same as
            // `destination`). 
            // 
            // `p` represents each parcel that are currently carried by the robot
            // or still needs to be picked up by him.
            let parcels = this.parcels.map(p => {
                // Do not modify the Parcel instance if the robot has yet not picked
                // up the `parcel`.
                if (p.place != this.place) {
                    return p;
                }
                // Otherwise, change the `place` property of the Parcel object to point to
                // the `destination` of any parcel(s), picked up by the robot (at current place) or
                // is already in robot's possession.
                return { 
                    place: destination, 
                    address: p.address
                };
            }).filter(p => p.place != p.address);

            // Return a new instance of `VillageState` representing the next
            // state of the automaton after a valid movement to `destination` 
            // and delivering the parcels (to their specified `address`),
            // and containing a (new) set of (yet undelivered) parcels.
            return new VillageState(destination, parcels);
        }
    }
}

VillageState.random = function(parcelCount = 5) {
    /*
     * `random` is a static method of `VillageState` which is responsible to 
     * return a new `VillageState` object which is used as a starting point for
     * a Robot object to start the journey of picking up & delivering all the 
     * parcels in Meadowfield.
     *
     * `parcelCount` lists the total no. of parcels that needs to be picked up & delivered
     * delivered by the Robot.
     * 
     * The returned instance (of `VillageState`) has two instance properties in
     * the form of `place` & 'parcels'.
     *
     * The `place` property will act as the starting place, will always reference
     * the "Post Office" of the village.
     *
     * And, the `parcels` property will be an array of Parcel objects (with each
     * parcel containing properties to reference to their respective pickup place & receiving
     * address). The robot needs to ensure all the parcel objects are delivered 
     * i.e., the length of `parcels` Array needs to be 0, to consider the journey
     */
    let parcels = [];
    for (let i = 0; i < parcelCount; i++) {
        let address = randomPick(Object.keys(roadGraph));
        let place;  // Still needs to be initialized.
        
        // Use a do/while loop to prevent creation of any Parcel object 
        // whose pickup and drop points are referencing the same place 
        // (i.e., they are sent from the same place that they are addressed 
        // to).
        do {
            place = randomPick(Object.keys(roadGraph));
        } while (place == address);

        parcels.push({place, address});
    }

    return new VillageState("Post Office", parcels);
};

// End of VillageState Class


// Demonstration that the above code is behaving in an expected manner.
let first = new VillageState(
    "Post Office", 
    [{place: "Post Office", address: "Alice's House"}]
);

let next = first.move("Alice's House");

// A matching result would mean:
// The robot is correctly simulating movement to a new place.
console.log(next.place);
// → Alice's House

// The robot is correctly simulating delivery of parcels to their
// specified address.
console.log(next.parcels);
// → []

// The move() function does not modify/mutate the original state i.e.,
// it continues to be pure.
console.log(first.place);
// → Post Office