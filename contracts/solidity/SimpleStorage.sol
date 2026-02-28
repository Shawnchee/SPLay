// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SimpleStorage
 * @dev A simple smart contract to store and retrieve a number.
 */
contract SimpleStorage {
    uint256 private _count;

    event ValueChanged(uint256 newValue);

    /**
     * @dev Sets a new value.
     * @param newValue The value to store.
     */
    function setValue(uint256 newValue) public {
        _count = newValue;
        emit ValueChanged(newValue);
    }

    /**
     * @dev Increments the stored value.
     */
    function increment() public {
        _count += 1;
        emit ValueChanged(_count);
    }

    /**
     * @dev Returns the current stored value.
     * @return The stored value.
     */
    function getValue() public view returns (uint256) {
        return _count;
    }
}
