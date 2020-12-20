/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
Filename : exploding-chickens/config/evaluation.js
Desc     : evaluation suite for testing game,
           player, and card interactions
Author(s): RAk3rman, SengdowJones
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/

//Packages
let game = require('../models/game.js');
const chalk = require('chalk');
const ora = require('ora');
const spinner = ora('');

//Services
let card_actions = require('../services/card-actions.js');
let game_actions = require('../services/game-actions.js');
let player_handler = require('../services/player-handler.js');

//Variables
let sample_game_id = "";

// Name : evaluation.game_creation()
// Desc : creates a test game and initializes to sample values
// Author(s) : RAk3rman
exports.game_creation = async function () {
    //Console header
    let console_head = `${chalk.bold.red('Evaluation')}: ${chalk.green('G-ADD')} `;
    spinner.info(console_head + `${chalk.bold('Evaluating game creation')}`);
    //Create sample game
    spinner.info(console_head + `Creating sample game`);
    let sample_game = await game_actions.create_game().catch(e => {failed_test(e)});
    spinner.succeed(console_head + `Created sample game with parameters: ` + JSON.stringify(sample_game));
    sample_game_id = sample_game["_id"];
}

// Name : evaluation.player_test()
// Desc : adds players to a sample game and tests interaction
// Author(s) : RAk3rman, SengdowJones
exports.player_test = async function () {
    //Console header
    let console_head = `${chalk.bold.red('Evaluation')}: ${chalk.yellow('P-ACT')} `;
    spinner.info(console_head + `${chalk.bold('Evaluating player actions')}`);
    //Create 4 sample players
    spinner.info(console_head + `Creating sample players (4 total)`);
    let player_a = await player_handler.modify_player(sample_game_id, undefined, "Player X", 0, "offline").catch(e => {failed_test(e)});
    spinner.succeed(console_head + `Created Player X (aka A) (1 of 4) with id: ` + player_a);
    let player_b = await player_handler.modify_player(sample_game_id, undefined, "Player B", 2, "online").catch(e => {failed_test(e)});
    spinner.succeed(console_head + `Created Player B (2 of 4) with id: ` + player_b);
    let player_c = await player_handler.modify_player(sample_game_id, undefined, "Player C", 3, "online").catch(e => {failed_test(e)});
    spinner.succeed(console_head + `Created Player C (3 of 4) with id: ` + player_c);
    let player_d = await player_handler.modify_player(sample_game_id, undefined, "Player D", 4, "online").catch(e => {failed_test(e)});
    spinner.succeed(console_head + `Created Player D (4 of 4) with id: ` + player_d);
    //Test player modification
    spinner.info(console_head + `Modifying Player X (aka A) and verifying changes with id: ` + player_a);
    await player_handler.modify_player(sample_game_id, player_a, "Player A", 1, "online").catch(e => {failed_test(e)});
    spinner.succeed(console_head + `Modified Player X (aka A) with id: ` + player_a);
    await game.findById({ _id: sample_game_id }, function (err, found_game) {
        if (err) {
            failed_test(err);
        } else {
            if (found_game.players.id(player_a).nickname === "Player A" || found_game.players.id(player_a).seat === 1 || found_game.players.id(player_a).status === "online") {
                spinner.succeed(console_head + `Verified Player A's changes with id: ` + player_a);
            } else {
                failed_test("Modified sample player values do not match");
            }
        }
    });
    //Test seat randomization
    spinner.info(console_head + `Randomizing seat positions for all players`);
    await player_handler.randomize_seats(sample_game_id).catch(e => {failed_test(e)});
    await game.findById({ _id: sample_game_id }, function (err, found_game) {
        if (err) {
            failed_test(err);
        } else {
            // For every player, express updated seat position to console
            for (let i = 0; i <= found_game.players.length - 1; i++) {
                spinner.succeed(console_head +
                    `Changed ` + found_game.players[i].nickname +
                    `'s (` + (i+1) + ` of ` + found_game.players.length + `)` +
                    ` seat position to ` + found_game.players[i].seat +
                    ` with id: ` + found_game.players[i]._id);
            }
        }
    });
}

// Name : evaluation.card_test()
// Desc : adds cards to a sample game and tests interaction
// Author(s) : RAk3rman
exports.card_test = async function () {
    //Console header
    let console_head = `${chalk.bold.red('Evaluation')}: ${chalk.cyan('C-ACT')} `;
    spinner.info(console_head + `${chalk.bold('Evaluating card actions')}`);
    //Import cards
    spinner.info(console_head + `Importing cards from base.json`);
    let card_count = await card_actions.import_cards(sample_game_id).catch(e => {failed_test(e)});
    spinner.succeed(console_head + `Imported ` + chalk.bold(card_count) + ` cards from base.json`);
    //Assign defuse cards
    spinner.info(console_head + `Assigning initial defuse cards to all players`);
    let defuse_count  = await card_actions.assign_defuse(sample_game_id).catch(e => {failed_test(e)});
    spinner.succeed(console_head + `Assigned ` + chalk.bold(defuse_count) + ` defuse cards to ` + chalk.bold(defuse_count) + ` players`);
    //Shuffle all cards in draw_deck
    spinner.info(console_head + `Shuffling all cards in draw deck`);
    let cards_in_deck = await card_actions.shuffle_draw_deck(sample_game_id).catch(e => {failed_test(e)});
    spinner.succeed(console_head + `Shuffled ` + chalk.bold(cards_in_deck) + ` cards in draw deck`);
    //Create player hand
    await card_actions.player_hand(sample_game_id).catch(e => {failed_test(e)});
    //Advance turn
    spinner.info(console_head + `Skipping turn`);
    await card_actions.skip_turn(sample_game_id).catch(e => {failed_test(e)});
    spinner.succeed(console_head + `Skipped ` );
    console.log(await game_actions.game_details(sample_game_id).seat_playing);
}

// Name : evaluation.game_test()
// Desc : tests game functions and interaction
// Author(s) :
exports.game_test = async function () {
    //Console header
    let console_head = `${chalk.bold.red('Evaluation')}: ${chalk.magenta('G-ACT')} `;
    spinner.info(console_head + `${chalk.bold('Evaluating game actions')}`);
    //TODO tests game functions and interaction
    spinner.warn(console_head + `${chalk.italic('//TODO//')}`);
}

// Name : evaluation.game_deletion()
// Desc : deletes a test game and cleans up
// Author(s) : RAk3rman
exports.game_deletion = async function () {
    //Console header
    let console_head = `${chalk.bold.red('Evaluation')}: ${chalk.redBright('G-DEL')} `;
    spinner.info(console_head + `${chalk.bold('Evaluating game deletion')}`);
    //Delete sample game
    spinner.info(console_head + `Deleting sample game (1 of 1)`);
    let sample_game = await game_actions.delete_game(sample_game_id).catch(e => {failed_test(e)});
    spinner.succeed(console_head + `Deleted game with id: ` + sample_game);
}

// Name : failed_test()
// Desc : called when a test fails, exits program and returns 1 (error)
// Author(s) : RAk3rman
function failed_test (desc) {
    spinner.fail(`${chalk.bold.red('Evaluation')}: ${chalk.red('FAIL')} Failed previous test with error message: "` + desc + `"`);
    process.exit(1);
}