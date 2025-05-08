// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SupplyChain {
    // Enum to represent product status
    enum Status { Created, InTransit, Delivered }
    
    // Enum to represent user roles
    enum Role { None, Admin, Manufacturer, Distributor, Retailer, Customer }
    
    // Struct to store product data
    struct Product {
        string productId;
        Status status;
        uint256 timestamp;
        bool exists;
        address creator;
    }
    
    // Struct to store user data
    struct User {
        address userAddress;
        Role role;
        bool exists;
    }
    
    // Mapping from product ID to product data
    mapping(string => Product) public products;
    
    // Mapping from address to user data
    mapping(address => User) public users;
    
    // Contract owner
    address public owner;
    
    // Events
    event ProductCreated(string productId, address creator, uint256 timestamp);
    event StatusUpdated(string productId, Status status, address updater, uint256 timestamp);
    event ProductDeleted(string productId, address deleter, uint256 timestamp);
    event UserRoleUpdated(address user, Role role, uint256 timestamp);
    
    // Constructor
    constructor() {
        owner = msg.sender;
        users[msg.sender] = User({
            userAddress: msg.sender,
            role: Role.Admin,
            exists: true
        });
    }
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
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
    
    modifier onlyDistributorOrRetailer() {
        require(
            users[msg.sender].exists && 
            (users[msg.sender].role == Role.Distributor || 
             users[msg.sender].role == Role.Retailer || 
             users[msg.sender].role == Role.Admin), 
            "Only distributor, retailer or admin can call this function"
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
    
    // Create a new product
    function createProduct(string memory productId) public onlyManufacturer {
        require(!products[productId].exists, "Product already exists");
        
        products[productId] = Product({
            productId: productId,
            status: Status.Created,
            timestamp: block.timestamp,
            exists: true,
            creator: msg.sender
        });
        
        emit ProductCreated(productId, msg.sender, block.timestamp);
    }
    
    // Update product status
    function updateProductStatus(string memory productId, Status newStatus) public onlyDistributorOrRetailer {
        require(products[productId].exists, "Product does not exist");
        require(newStatus <= Status.Delivered, "Invalid status value");
        
        // Update status
        products[productId].status = newStatus;
        products[productId].timestamp = block.timestamp;
        
        emit StatusUpdated(productId, newStatus, msg.sender, block.timestamp);
    }
    
    // Delete a product
    function deleteProduct(string memory productId) public onlyAdmin {
        require(products[productId].exists, "Product does not exist");
        
        delete products[productId];
        
        emit ProductDeleted(productId, msg.sender, block.timestamp);
    }
    
    // Get product details
    function getProduct(string memory productId) public view onlyAuthenticated returns (Status status, uint256 timestamp, bool exists, address creator) {
        Product memory product = products[productId];
        return (product.status, product.timestamp, product.exists, product.creator);
    }
    
    // Check if user has a specific role
    function hasRole(address userAddress, Role role) public view returns (bool) {
        return users[userAddress].exists && users[userAddress].role == role;
    }
    
    // Transfer ownership
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        owner = newOwner;
        
        // Ensure new owner has admin role
        if (!users[newOwner].exists) {
            users[newOwner] = User({
                userAddress: newOwner,
                role: Role.Admin,
                exists: true
            });
        } else {
            users[newOwner].role = Role.Admin;
        }
    }
}