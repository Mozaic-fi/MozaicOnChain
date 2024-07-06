// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import { XMozToken } from "../../../contracts/tokens/XMOZToken.sol";

contract XMozTest is Test {
    address public immutable owner = makeAddr("Owner");
    address public immutable whiteListedUser = makeAddr("whiteListedUser");
    address public immutable noneWhiteListedUser = makeAddr("noneWhiteListedUser");
    address public immutable mozStaking = makeAddr("Staking");

    XMozToken xmoz;

    function setUp() public {
        vm.prank(owner);
        xmoz = new XMozToken(mozStaking);
    }

    function testConstructor() public {
        assertTrue(xmoz.isTransferWhitelisted(address(xmoz)), "Contract not whitelisted");
    }

    function testAddToWhitelist() public {
        vm.prank(owner);
        xmoz.updateTransferWhitelist(whiteListedUser, true);
        assertTrue(xmoz.isTransferWhitelisted(whiteListedUser), "Address not whitelisted");
        assertFalse(xmoz.isTransferWhitelisted(noneWhiteListedUser), "Address whitelisted");
    }

    function testRemoveFromWhitelist() public {
        vm.prank(owner);
        xmoz.updateTransferWhitelist(whiteListedUser, true);
        assertTrue(xmoz.isTransferWhitelisted(whiteListedUser), "Address not whitelisted");
        vm.prank(owner);
        xmoz.updateTransferWhitelist(whiteListedUser, false);
        assertFalse(xmoz.isTransferWhitelisted(whiteListedUser), "Address whitelisted");
    }

    function testNoneStakingContract() public {
        vm.expectRevert("Invalid caller");
        xmoz.mint(100, noneWhiteListedUser);
        vm.expectRevert("Invalid caller");
        xmoz.burn(100, noneWhiteListedUser);
    }

    function testStakingContract() public{
        vm.prank(mozStaking);
        xmoz.mint(100, noneWhiteListedUser);
        assertTrue(xmoz.balanceOf(noneWhiteListedUser) == 100, "Balance not updated");
        vm.prank(mozStaking);
        xmoz.burn(100, noneWhiteListedUser);
        assertTrue(xmoz.balanceOf(noneWhiteListedUser) == 0, "Balance not updated");
    }


    function testSendViaNonWhitelisted() public {
        vm.prank(mozStaking);
        xmoz.mint(100, noneWhiteListedUser);
        assertTrue(xmoz.balanceOf(noneWhiteListedUser) == 100, "Balance not updated");
        vm.prank(noneWhiteListedUser);
        vm.expectRevert("transfer: not allowed");
        xmoz.transfer(whiteListedUser, 100);
    }

    function testSendViaWhitelisted() public {
        vm.prank(owner);
        xmoz.updateTransferWhitelist(whiteListedUser, true);
        vm.prank(mozStaking);
        xmoz.mint(100, whiteListedUser);
        assertTrue(xmoz.balanceOf(whiteListedUser) == 100, "Balance not updated");
        vm.prank(whiteListedUser);
        xmoz.transfer(noneWhiteListedUser, 100);
        assertTrue(xmoz.balanceOf(noneWhiteListedUser) == 100, "Balance not updated");
    }

}

