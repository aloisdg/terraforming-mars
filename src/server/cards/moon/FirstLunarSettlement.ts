import {CardName} from '../../../common/cards/CardName';
import {Player} from '../../Player';
import {Tag} from '../../../common/cards/Tag';
import {PreludeCard} from '../prelude/PreludeCard';
import {PlaceMoonColonyTile} from '../../moon/PlaceMoonColonyTile';
import {CardRenderer} from '../render/CardRenderer';
import {TileType} from '../../../common/TileType';
import {IProjectCard} from '../IProjectCard';
import {AltSecondaryTag} from '../../../common/cards/render/AltSecondaryTag';
import {Units} from '../../../common/Units';

export class FirstLunarSettlement extends PreludeCard implements IProjectCard {
  constructor() {
    super({
      name: CardName.FIRST_LUNAR_SETTLEMENT,
      tags: [Tag.CITY, Tag.MOON],
      productionBox: Units.of({megacredits: 1}),
      metadata: {
        description: 'Place a colony tile on the Moon and Raise the Colony Rate 1 step. Increase your M€ production 1 step.',
        cardNumber: '',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(1)).moonColony({secondaryTag: AltSecondaryTag.MOON_COLONY_RATE});
        }),
      },
    });
  }

  public tilesBuilt = [TileType.MOON_COLONY];

  public play(player: Player) {
    player.production.adjust(this.productionBox, {log: true});
    player.game.defer(new PlaceMoonColonyTile(player));
    return undefined;
  }
}
