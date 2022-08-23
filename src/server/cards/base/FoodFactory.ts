import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {Player} from '../../Player';
import {Resources} from '../../../common/Resources';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Units} from '../../../common/Units';

export class FoodFactory extends Card implements IProjectCard {
  constructor() {
    super({
      cardType: CardType.AUTOMATED,
      name: CardName.FOOD_FACTORY,
      tags: [Tag.BUILDING],
      cost: 12,
      productionBox: Units.of({megacredits: 4, plants: -1}),
      victoryPoints: 1,

      metadata: {
        cardNumber: '041',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => {
            pb.minus().plants(1).br;
            pb.plus().megacredits(4);
          });
        }),
        description: 'Decrease your Plant production 1 step and increase your M€ production 4 steps',
      },
    });
  }
  public override canPlay(player: Player): boolean {
    return player.production.plants >= 1;
  }
  public play(player: Player) {
    player.production.add(Resources.PLANTS, -1);
    player.production.add(Resources.MEGACREDITS, 4);
    return undefined;
  }
}
