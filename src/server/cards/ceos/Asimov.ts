import {CardName} from '../../../common/cards/CardName';
import {Player} from '../../Player';
import {PlayerInput} from '../../PlayerInput';
import {CardRenderer} from '../render/CardRenderer';
import {CeoCard} from './CeoCard';
import {inplaceShuffle} from '../../utils/shuffle';
import {UnseededRandom} from '../../../server/Random';
import {ASIMOV_AWARD_BONUS} from '../../../common/constants';

import {IAward} from '../../awards/IAward';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {Size} from '../../../common/cards/render/Size';

import {ALL_AWARDS} from '../../awards/Awards';
import {AwardScorer} from '../../awards/AwardScorer';

export class Asimov extends CeoCard {
  constructor() {
    super({
      name: CardName.ASIMOV,
      metadata: {
        cardNumber: 'L01',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.award().nbsp.colon().text('+' + ASIMOV_AWARD_BONUS, Size.LARGE);
          b.br.br.br;
          b.opgArrow().text('10-X').award().asterix();
        }),
        description: 'You have +' + ASIMOV_AWARD_BONUS + ' score for all awards. Once per game, draw 10-X awards (min. 1), where X is the current generation number. You may put one into the game and fund it for free.',
      },
    });
  }

  public override canAct(player: Player): boolean {
    if (!super.canAct(player)) {
      return false;
    }
    if (player.game.isSoloMode()) return false; // Awards are disabled in solo mode
    return !player.game.allAwardsFunded() && this.isDisabled === false;
  }

  public action(player: Player): PlayerInput | undefined {
    const game = player.game;
    const awardCount = Math.max(1, 10 - game.generation);
    const validAwards = this.getValidAwards(player);
    inplaceShuffle(validAwards, UnseededRandom.INSTANCE);

    const freeAward = new OrOptions();
    freeAward.title = 'Select award to put into play and fund';
    freeAward.buttonLabel = 'Confirm';

    freeAward.options = validAwards.slice(0, awardCount).map((award) => this.selectAwardToFund(player, award));
    freeAward.options.push(
      new SelectOption('Do nothing', 'Confirm', () => {
        game.log('${0} chose not to fund any award', (b) => b.player(player));
        this.isDisabled = true;
        return undefined;
      }),
    );

    return freeAward;
  }

  private selectAwardToFund(player: Player, award: IAward): SelectOption {
    const game = player.game;
    const scorer = new AwardScorer(game, award);
    // Sort the players by score:
    const players: Array<Player> = game.getPlayers().slice();
    players.sort((p1, p2) => scorer.get(p2) - scorer.get(p1));
    let title = 'Fund ' + award.name + ' award' + ' [';
    title += players
      .sort((a, b) => scorer.get(b) - scorer.get(a))
      .map((player) => player.name + ': ' + scorer.get(player))
      .join(' / ');
    title += ']';

    return new SelectOption(title, 'Confirm', () => {
      player.game.awards.push(award);
      player.game.fundAward(player, award);
      this.isDisabled = true;
      return undefined;
    });
  }

  private getValidAwards(player: Player): Array<IAward> {
    // NB: This makes no effort to maintain Award synergy.
    const gameOptions = player.game.gameOptions;
    const validAwards = ALL_AWARDS.filter((award) => {
      // Remove awards already in the game
      if (player.game.awards.includes(award)) return false;
      // Remove awards that require unused variants/expansions
      if (!gameOptions.venusNextExtension && award.name === 'Venuphile') return false;
      if (!gameOptions.turmoilExtension && award.name === 'Politician') return false;
      if (!gameOptions.aresExtension && award.name === 'Entrepreneur') return false;
      if (!gameOptions.moonExpansion && award.name === 'Full Moon') return false;
      if (!gameOptions.moonExpansion && award.name === 'Lunar Magnate') return false;
      return true;
    });
    if (validAwards.length === 0) throw new Error('getValidAwards award list is empty.');
    return validAwards;
  }
}
