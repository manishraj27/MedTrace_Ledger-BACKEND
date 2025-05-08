// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SupplyChain {
    // Enum to represent product status
    enum Status { 
        Created, 
        QualityChecked, 
        ShippedToDistributor, 
        ReceivedByDistributor, 
        ShippedToRetailer, 
        ReceivedByRetailer, 
        Sold, 
        Dispensed, 
        Recalled 
    }
    
    // Enum to represent user roles
    enum Role { None, Admin, Manufacturer, Distributor, Retailer, Customer }
    
    // Struct to store product data
    struct Product {
        string productId;
        Status status;
        uint256 timestamp;
        bool exists;
        address creator;
        address currentOwner;
        string batchNumber;
        uint256 expiryDate;
        int temperature; // Stored as integer, divide by 10 for actual value
    }
    
    // Struct to store user data
    struct User {
        address userAddress;
        Role role;
        bool exists;
    }
    
    // Struct to store transfer data
    struct Transfer {
        string transferId;
        string productId;
        address sender;
        address receiver;
        uint256 timestamp;
        bool completed;
        int temperature;
    }
    
    // Struct to store shipment data
    struct Shipment {
        string shipmentId;
        string[] productIds;
        address sender;
        address receiver;
        uint256 createdAt;
        uint256 deliveredAt;
        bool isDelivered;
    }
    
    // Mappings
    mapping(string => Product) public products;
    mapping(address => User) public users;
    mapping(string => Transfer) public transfers;
    mapping(string => Shipment) public shipments;
    
    // Events
    event ProductCreated(string productId, address creator, uint256 timestamp);
    event StatusUpdated(string productId, Status status, address updater, uint256 timestamp);
    event ProductDeleted(string productId, address deleter, uint256 timestamp);
    event UserRoleUpdated(address user, Role role, uint256 timestamp);
    event TransferInitiated(string transferId, string productId, address sender, address receiver);
    event TransferCompleted(string transferId, string productId, address sender, address receiver);
    event ShipmentCreated(string shipmentId, address sender, address receiver);
    event ShipmentDelivered(string shipmentId, address receiver);
    event TemperatureRecorded(string productId, int temperature, uint256 timestamp);
    
    // Constructor
    constructor() {
        address owner = msg.sender;
        users[owner] = User({
            userAddress: owner,
            role: Role.Admin,
            exists: true
        });
    }
    
    // Modifiers
    modifier onlyAdmin() {
        require(users[msg.sender].exists && users[msg.sender].role == Role.Admin, "Only admin can call this function");
        _;
    }
    
    modifier onlyManufacturer() {
        require(
            users[msg.sender].exists && 
            (users[msg.sender].role == Role.Manufacturer || users[msg.sender].role == Role.Admin), 
            "Only manufacturer or admin can call this function"
        );
        _;
    }
    
    modifier onlyDistributor() {
        require(
            users[msg.sender].exists && 
            (users[msg.sender].role == Role.Distributor || users[msg.sender].role == Role.Admin), 
            "Only distributor or admin can call this function"
        );
        _;
    }
    
    modifier onlyRetailer() {
        require(
            users[msg.sender].exists && 
            (users[msg.sender].role == Role.Retailer || users[msg.sender].role == Role.Admin), 
            "Only retailer or admin can call this function"
        );
        _;
    }
    
    modifier onlyAuthenticated() {
        require(users[msg.sender].exists, "User is not authenticated");
        _;
    }
    
    // User management functions
    function setUserRole(address userAddress, Role role) public onlyAdmin {
        users[userAddress] = User({
            userAddress: userAddress,
            role: role,
            exists: true
        });
        
        emit UserRoleUpdated(userAddress, role, block.timestamp);
    }
    
    // Product management functions
    function createProduct(
        string memory productId, 
        string memory batchNumber, 
        uint256 expiryDate, 
        int temperature
    ) public onlyManufacturer {
        require(!products[productId].exists, "Product already exists");
        
        products[productId] = Product({
            productId: productId,
            status: Status.Created,
            timestamp: block.timestamp,
            exists: true,
            creator: msg.sender,
            currentOwner: msg.sender,
            batchNumber: batchNumber,
            expiryDate: expiryDate,
            temperature: temperature
        });
        
        emit ProductCreated(productId, msg.sender, block.timestamp);
        emit TemperatureRecorded(productId, temperature, block.timestamp);
    }
    
    function updateProductStatus(string memory productId, Status status) public onlyAuthenticated {
        require(products[productId].exists, "Product does not exist");
        require(products[productId].currentOwner == msg.sender, "Only current owner can update status");
        
        products[productId].status = status;
        
        emit StatusUpdated(productId, status, msg.sender, block.timestamp);
    }
    
    function deleteProduct(string memory productId) public onlyAdmin {
        require(products[productId].exists, "Product does not exist");
        
        delete products[productId];
        
        emit ProductDeleted(productId, msg.sender, block.timestamp);
    }
    
    // Transfer functions
    function initiateTransfer(
        string memory transferId,
        string memory productId,
        address receiver,
        int temperature
    ) public onlyAuthenticated {
        require(products[productId].exists, "Product does not exist");
        require(products[productId].currentOwner == msg.sender, "You don't own this product");
        
        transfers[transferId] = Transfer({
            transferId: transferId,
            productId: productId,
            sender: msg.sender,
            receiver: receiver,
            timestamp: block.timestamp,
            completed: false,
            temperature: temperature
        });
        
        emit TransferInitiated(transferId, productId, msg.sender, receiver);
        emit TemperatureRecorded(productId, temperature, block.timestamp);
    }
    
    function completeTransfer(string memory transferId) public onlyAuthenticated {
        Transfer storage transfer = transfers[transferId];
        require(!transfer.completed, "Transfer already completed");
        require(transfer.receiver == msg.sender, "Only the receiver can complete the transfer");
        
        transfer.completed = true;
        
        // Update product owner and status
        Product storage product = products[transfer.productId];
        product.currentOwner = msg.sender;
        
        // Update status based on receiver role
        if (users[msg.sender].role == Role.Distributor) {
            product.status = Status.ReceivedByDistributor;
        } else if (users[msg.sender].role == Role.Retailer) {
            product.status = Status.ReceivedByRetailer;
        } else if (users[msg.sender].role == Role.Customer) {
            product.status = Status.Sold;
        }
        
        emit TransferCompleted(transfer.transferId, transfer.productId, transfer.sender, transfer.receiver);
    }
    
    // Shipment functions
    function createShipment(
        string memory shipmentId,
        string[] memory productIds,
        address receiver
    ) public onlyAuthenticated {
        require(productIds.length > 0, "Shipment must contain at least one product");
        
        // Verify sender owns all products
        for (uint i = 0; i < productIds.length; i++) {
            require(products[productIds[i]].exists, "Product does not exist");
            require(products[productIds[i]].currentOwner == msg.sender, "You don't own this product");
        }
        
        shipments[shipmentId] = Shipment({
            shipmentId: shipmentId,
            productIds: productIds,
            sender: msg.sender,
            receiver: receiver,
            createdAt: block.timestamp,
            deliveredAt: 0,
            isDelivered: false
        });
        
        // Update product status
        for (uint i = 0; i < productIds.length; i++) {
            if (users[receiver].role == Role.Distributor) {
                products[productIds[i]].status = Status.ShippedToDistributor;
            } else if (users[receiver].role == Role.Retailer) {
                products[productIds[i]].status = Status.ShippedToRetailer;
            }
        }
        
        emit ShipmentCreated(shipmentId, msg.sender, receiver);
    }
    
    function receiveShipment(string memory shipmentId) public onlyAuthenticated {
        Shipment storage shipment = shipments[shipmentId];
        require(!shipment.isDelivered, "Shipment already delivered");
        require(shipment.receiver == msg.sender, "Only the receiver can mark shipment as delivered");
        
        shipment.isDelivered = true;
        shipment.deliveredAt = block.timestamp;
        
        // Update product status and ownership
        for (uint i = 0; i < shipment.productIds.length; i++) {
            products[shipment.productIds[i]].currentOwner = msg.sender;
            
            if (users[msg.sender].role == Role.Distributor) {
                products[shipment.productIds[i]].status = Status.ReceivedByDistributor;
            } else if (users[msg.sender].role == Role.Retailer) {
                products[shipment.productIds[i]].status = Status.ReceivedByRetailer;
            }
        }
        
        emit ShipmentDelivered(shipmentId, msg.sender);
    }
    
    // Temperature recording
    function recordTemperature(string memory productId, int temperature) public onlyAuthenticated {
        require(products[productId].exists, "Product does not exist");
        require(
            products[productId].currentOwner == msg.sender || 
            users[msg.sender].role == Role.Admin,
            "Only the current owner or admin can record temperature"
        );
        
        products[productId].temperature = temperature;
        
        emit TemperatureRecorded(productId, temperature, block.timestamp);
    }
    
    // Getter functions
    function getProductDetails(string memory productId) public view returns (
        Status status,
        address creator,
        address currentOwner,
        string memory batchNumber,
        uint256 expiryDate,
        int temperature
    ) {
        require(products[productId].exists, "Product does not exist");
        Product memory product = products[productId];
        
        return (
            product.status,
            product.creator,
            product.currentOwner,
            product.batchNumber,
            product.expiryDate,
            product.temperature
        );
    }
}